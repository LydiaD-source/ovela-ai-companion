
-- =====================================================
-- SECURITY HARDENING MIGRATION - PART 2
-- Fix remaining functions without search_path
-- =====================================================

-- Fix onboard_invite_user_atomic function (consolidate duplicates)
DROP FUNCTION IF EXISTS public.onboard_invite_user_atomic(text, text);
DROP FUNCTION IF EXISTS public.onboard_invite_user_atomic(text, uuid, text);

CREATE OR REPLACE FUNCTION public.onboard_invite_user_atomic(p_invite_code text, p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_now timestamptz := now();
  v_email text := lower(trim(p_email));
  v_user_id uuid;
  v_profile_id uuid;
  v_invite record;
  v_tier text := 'premium';
  v_expires_at timestamptz;
  v_profile_existed boolean := false;
BEGIN
  -- Serialize by invite code to avoid races and over-usage
  PERFORM pg_advisory_xact_lock(hashtext(p_invite_code));

  -- Validate invite
  SELECT * INTO v_invite
  FROM public.invite_links
  WHERE code = p_invite_code
    AND active = true
    AND (expires_at IS NULL OR expires_at > v_now)
    AND (max_uses IS NULL OR COALESCE(uses,0) < max_uses)
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'invite_invalid_or_expired');
  END IF;

  -- Determine tier and expiry
  v_tier := COALESCE(NULLIF(trim(v_invite.type), ''), 'premium');
  IF v_tier NOT IN ('free','premium','ultimate') THEN
    v_tier := 'premium';
  END IF;
  v_expires_at := COALESCE(v_invite.expires_at, v_now + interval '24 hours');

  -- Resolve user id (prefer current auth user)
  SELECT auth.uid() INTO v_user_id;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = v_email LIMIT 1;
  END IF;
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'user_not_found');
  END IF;

  -- Track existence
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_id = v_user_id) INTO v_profile_existed;

  -- UPSERT profile
  INSERT INTO public.profiles (
    user_id, email, full_name,
    tutorial_shown, invited_promo_access, effective_tier, invited_premium_expires_at,
    subscription_tier, subscription_active,
    is_first_login, first_time_in_settings,
    created_at, updated_at
  ) VALUES (
    v_user_id, v_email, split_part(v_email, '@', 1),
    false, true, v_tier, v_expires_at,
    CASE WHEN v_tier IN ('premium','ultimate') THEN v_tier ELSE 'free' END, true,
    NOT v_profile_existed, NOT v_profile_existed,
    v_now, v_now
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    tutorial_shown = false,
    invited_promo_access = true,
    effective_tier = v_tier,
    invited_premium_expires_at = v_expires_at,
    subscription_tier = CASE WHEN v_tier IN ('premium','ultimate') THEN v_tier ELSE 'free' END,
    subscription_active = true,
    is_first_login = profiles.is_first_login,
    first_time_in_settings = profiles.first_time_in_settings,
    updated_at = v_now
  RETURNING id INTO v_profile_id;

  -- Reflect access in subscriptions
  INSERT INTO public.user_subscriptions (
    user_id, subscription_tier, status, source,
    current_period_end, promo_expires_at, created_at, updated_at
  ) VALUES (
    v_user_id, CASE WHEN v_tier IN ('premium','ultimate') THEN v_tier ELSE 'free' END, 'active', 'invite_link',
    v_expires_at, v_expires_at, v_now, v_now
  )
  ON CONFLICT (user_id) DO UPDATE SET
    subscription_tier = EXCLUDED.subscription_tier,
    status = 'active',
    source = 'invite_link',
    current_period_end = EXCLUDED.current_period_end,
    promo_expires_at = EXCLUDED.promo_expires_at,
    updated_at = v_now;

  -- Whitelist authorization
  INSERT INTO public.authorized_users (email, is_active, notes, created_at, updated_at)
  VALUES (v_email, true, 'invite-link-onboarding', v_now, v_now)
  ON CONFLICT (email) DO UPDATE SET is_active = true, updated_at = v_now;

  -- Increment invite usage
  UPDATE public.invite_links
  SET uses = COALESCE(uses,0) + 1,
      updated_at = v_now
  WHERE id = v_invite.id;

  -- Final success payload
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'profile_id', v_profile_id,
    'tier', v_tier,
    'premium_until', v_expires_at,
    'tutorial_forced', true,
    'show_tutorial', true,
    'profile_existed', v_profile_existed
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'error_code', SQLSTATE
  );
END;
$function$;

-- Create overload for 3-parameter version
CREATE OR REPLACE FUNCTION public.onboard_invite_user_atomic(p_invite_code text, p_user_id uuid, p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Delegate to the 2-param version (user_id is resolved internally)
  RETURN public.onboard_invite_user_atomic(p_invite_code, p_email);
END;
$function$;
