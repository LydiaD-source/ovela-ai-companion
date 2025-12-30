
-- =====================================================
-- SECURITY HARDENING MIGRATION - PART 3
-- Fix ALL remaining functions without search_path
-- =====================================================

-- Drop all existing overloads first
DROP FUNCTION IF EXISTS public.ensure_user_profile(uuid, text);
DROP FUNCTION IF EXISTS public.onboard_invite_user_atomic(uuid, text, text, text);
DROP FUNCTION IF EXISTS public.onboard_invite_user_atomic(uuid, text);

-- Recreate ensure_user_profile with 2-param signature if it exists
CREATE OR REPLACE FUNCTION public.ensure_user_profile(uid uuid, user_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  existing_profile record;
  admin_invite record;
  promo_exp timestamptz;
BEGIN
  -- Ensure profile FIRST
  SELECT * INTO existing_profile FROM profiles WHERE user_id = uid;
  IF existing_profile IS NULL THEN
    INSERT INTO profiles (
      user_id, email, full_name, created_at, updated_at, 
      is_first_login, first_time_in_settings
    ) VALUES (
      uid, lower(trim(user_email)), split_part(user_email, '@', 1), 
      now(), now(), true, true
    );
  END IF;

  -- Ensure subscription AFTER profile exists
  INSERT INTO public.user_subscriptions (
    user_id, subscription_tier, status, created_at, updated_at
  ) VALUES (
    uid, 'free', 'active', now(), now()
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Admin invite path
  SELECT * INTO admin_invite
  FROM admin_invites
  WHERE lower(email) = lower(user_email)
    AND status = 'pending'
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY created_at DESC
  LIMIT 1;

  IF admin_invite IS NOT NULL THEN
    promo_exp := COALESCE(admin_invite.expires_at, now() + interval '24 hours');

    UPDATE profiles
    SET subscription_tier = 'premium',
        subscription_active = true,
        is_first_login = true,
        first_time_in_settings = true,
        invited_premium_expires_at = promo_exp,
        updated_at = now()
    WHERE user_id = uid;

    UPDATE user_subscriptions
    SET subscription_tier = 'premium',
        status = 'active',
        current_period_end = promo_exp,
        updated_at = now()
    WHERE user_id = uid;

    UPDATE admin_invites
    SET consumed = true,
        consumed_at = now(),
        status = 'used',
        token_used_by_id = uid,
        accepted_at = now(),
        used_at = now()
    WHERE id = admin_invite.id;

    INSERT INTO admin_emails (email)
    VALUES (lower(user_email))
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO authorized_users (email, is_active, notes)
    VALUES (lower(user_email), true, 'auto-added from admin invite')
    ON CONFLICT (email) DO UPDATE SET is_active = true, updated_at = now();

    RETURN (
      SELECT json_build_object(
        'subscription_tier', p.subscription_tier,
        'is_first_login', p.is_first_login,
        'first_time_in_settings', p.first_time_in_settings,
        'invited_premium_expires_at', p.invited_premium_expires_at,
        'admin_granted', true
      ) FROM profiles p WHERE p.user_id = uid
    );
  END IF;

  RETURN (
    SELECT json_build_object(
      'subscription_tier', p.subscription_tier,
      'is_first_login', p.is_first_login,
      'first_time_in_settings', p.first_time_in_settings,
      'invited_premium_expires_at', p.invited_premium_expires_at
    ) FROM profiles p WHERE p.user_id = uid
  );
END;
$function$;

-- Fix the 4-param overload
CREATE OR REPLACE FUNCTION public.onboard_invite_user_atomic(
  p_user_id uuid, 
  p_email text, 
  p_full_name text, 
  p_subscription_tier text DEFAULT 'premium'::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_now timestamptz := now();
  v_email text := lower(trim(p_email));
  v_tier text := COALESCE(p_subscription_tier, 'premium');
  v_expires_at timestamptz := v_now + interval '24 hours';
  v_profile_existed boolean := false;
  v_profile_id uuid;
BEGIN
  -- Track existence
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_id = p_user_id) INTO v_profile_existed;

  -- UPSERT profile
  INSERT INTO public.profiles (
    user_id, email, full_name,
    tutorial_shown, invited_promo_access, effective_tier, invited_premium_expires_at,
    subscription_tier, subscription_active,
    is_first_login, first_time_in_settings,
    created_at, updated_at
  ) VALUES (
    p_user_id, v_email, COALESCE(p_full_name, split_part(v_email, '@', 1)),
    false, true, v_tier, v_expires_at,
    v_tier, true,
    NOT v_profile_existed, NOT v_profile_existed,
    v_now, v_now
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    tutorial_shown = false,
    invited_promo_access = true,
    effective_tier = v_tier,
    invited_premium_expires_at = v_expires_at,
    subscription_tier = v_tier,
    subscription_active = true,
    updated_at = v_now
  RETURNING id INTO v_profile_id;

  -- Reflect access in subscriptions
  INSERT INTO public.user_subscriptions (
    user_id, subscription_tier, status, source,
    current_period_end, promo_expires_at, created_at, updated_at
  ) VALUES (
    p_user_id, v_tier, 'active', 'invite_link',
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

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'profile_id', v_profile_id,
    'tier', v_tier,
    'premium_until', v_expires_at,
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

-- Fix the 2-param (uuid, text) overload
CREATE OR REPLACE FUNCTION public.onboard_invite_user_atomic(_user_id uuid, _email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN public.onboard_invite_user_atomic(_user_id, _email, NULL, 'premium');
END;
$function$;
