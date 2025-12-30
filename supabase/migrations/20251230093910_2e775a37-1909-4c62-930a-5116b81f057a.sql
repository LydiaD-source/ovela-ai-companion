
-- =====================================================
-- SECURITY HARDENING MIGRATION
-- Fixes: function search_path, removes overly permissive policies
-- =====================================================

-- 1. Fix functions without proper search_path
CREATE OR REPLACE FUNCTION public.ensure_user_profile()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  current_uid uuid;
  current_email text;
  existing_profile record;
  admin_invite record;
  promo_exp timestamptz;
BEGIN
  SELECT auth.uid() INTO current_uid;
  IF current_uid IS NULL THEN
    RAISE EXCEPTION 'auth.uid() returned NULL – must be called with a valid Supabase session';
  END IF;

  SELECT email INTO current_email FROM auth.users WHERE id = current_uid;
  IF current_email IS NULL THEN
    RAISE EXCEPTION 'No email found for auth.uid()=%', current_uid;
  END IF;

  -- Ensure profile FIRST
  SELECT * INTO existing_profile FROM profiles WHERE user_id = current_uid;
  IF existing_profile IS NULL THEN
    INSERT INTO profiles (
      user_id, email, full_name, created_at, updated_at, 
      is_first_login, first_time_in_settings
    ) VALUES (
      current_uid, lower(trim(current_email)), split_part(current_email, '@', 1), 
      now(), now(), true, true
    );
  END IF;

  -- Ensure subscription AFTER profile exists
  INSERT INTO public.user_subscriptions (
    user_id, subscription_tier, status, created_at, updated_at
  ) VALUES (
    current_uid, 'free', 'active', now(), now()
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Admin invite path
  SELECT * INTO admin_invite
  FROM admin_invites
  WHERE lower(email) = lower(current_email)
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
    WHERE user_id = current_uid;

    UPDATE user_subscriptions
    SET subscription_tier = 'premium',
        status = 'active',
        current_period_end = promo_exp,
        updated_at = now()
    WHERE user_id = current_uid;

    UPDATE admin_invites
    SET consumed = true,
        consumed_at = now(),
        status = 'used',
        token_used_by_id = current_uid,
        accepted_at = now(),
        used_at = now()
    WHERE id = admin_invite.id;

    INSERT INTO admin_emails (email)
    VALUES (lower(current_email))
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO authorized_users (email, is_active, notes)
    VALUES (lower(current_email), true, 'auto-added from admin invite')
    ON CONFLICT (email) DO UPDATE SET is_active = true, updated_at = now();

    RETURN (
      SELECT json_build_object(
        'subscription_tier', p.subscription_tier,
        'is_first_login', p.is_first_login,
        'first_time_in_settings', p.first_time_in_settings,
        'invited_premium_expires_at', p.invited_premium_expires_at,
        'admin_granted', true
      ) FROM profiles p WHERE p.user_id = current_uid
    );
  END IF;

  RETURN (
    SELECT json_build_object(
      'subscription_tier', p.subscription_tier,
      'is_first_login', p.is_first_login,
      'first_time_in_settings', p.first_time_in_settings,
      'invited_premium_expires_at', p.invited_premium_expires_at
    ) FROM profiles p WHERE p.user_id = current_uid
  );
END;
$function$;

-- 2. Fix health_check_access_control function
CREATE OR REPLACE FUNCTION public.health_check_access_control()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_result jsonb;
  v_admin_count int;
  v_subscription_count int;
  v_invite_count int;
  v_orphaned_profiles int;
BEGIN
  SELECT COUNT(*) INTO v_admin_count FROM profiles WHERE role = 'admin';
  
  SELECT COUNT(*) INTO v_subscription_count 
  FROM user_subscriptions 
  WHERE status = 'active';
  
  SELECT COUNT(*) INTO v_invite_count 
  FROM profiles 
  WHERE invited_premium_expires_at > now();
  
  SELECT COUNT(*) INTO v_orphaned_profiles
  FROM profiles p
  WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.user_id);
  
  v_result := jsonb_build_object(
    'status', 'OK',
    'timestamp', now(),
    'admin_count', v_admin_count,
    'active_subscribers', v_subscription_count,
    'active_invite_users', v_invite_count,
    'orphaned_profiles', v_orphaned_profiles,
    'checks', jsonb_build_object(
      'admin_validation', v_admin_count >= 0,
      'subscriber_validation', v_subscription_count >= 0,
      'invite_validation', v_invite_count >= 0,
      'orphan_check', v_orphaned_profiles = 0
    )
  );
  
  RETURN v_result;
END;
$function$;

-- 3. Remove overly permissive subscription policy (USING true is dangerous)
DROP POLICY IF EXISTS "subscriptions_service_all" ON public.user_subscriptions;

-- 4. Remove duplicate/redundant SELECT policies on user_subscriptions (keep the strictest ones)
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.user_subscriptions;

-- 5. Ensure user_subscriptions UPDATE is properly restricted
DROP POLICY IF EXISTS "subscriptions_update_own" ON public.user_subscriptions;
CREATE POLICY "subscriptions_update_own" ON public.user_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Remove duplicate user_consents policies (keep the strictest)
DROP POLICY IF EXISTS "Users can insert own consents" ON public.user_consents;
DROP POLICY IF EXISTS "Users can read own consents" ON public.user_consents;
DROP POLICY IF EXISTS "Service role can manage user_consents" ON public.user_consents;

-- 7. Add missing DELETE policy for support_tickets (users should be able to delete their own)
DROP POLICY IF EXISTS "Users can delete their own support tickets" ON public.support_tickets;
CREATE POLICY "Users can delete their own support tickets" ON public.support_tickets
  FOR DELETE
  USING (auth.uid() = user_id);

-- 8. Add missing UPDATE policy for support_tickets
DROP POLICY IF EXISTS "Users can update their own support tickets" ON public.support_tickets;
CREATE POLICY "Users can update their own support tickets" ON public.support_tickets
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 9. Add DELETE policy for user_context
DROP POLICY IF EXISTS "Users can delete their own context" ON public.user_context;
CREATE POLICY "Users can delete their own context" ON public.user_context
  FOR DELETE
  USING (auth.uid() = user_id);

-- 10. Ensure purchases table has INSERT policy for users
DROP POLICY IF EXISTS "Users can create their own purchases" ON public.purchases;
CREATE POLICY "Users can create their own purchases" ON public.purchases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
