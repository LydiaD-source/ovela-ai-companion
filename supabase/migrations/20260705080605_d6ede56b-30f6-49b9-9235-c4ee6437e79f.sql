
DROP POLICY IF EXISTS "Anyone can read system settings" ON public.system_settings;
CREATE POLICY "Admins can read system settings"
  ON public.system_settings FOR SELECT
  TO authenticated
  USING (public.is_admin_user());

CREATE POLICY "Public can view active visible client products"
  ON public.client_products FOR SELECT
  TO anon, authenticated
  USING (active = true AND visible_on_website = true);

DROP POLICY IF EXISTS "Service role can manage premium access log" ON public.premium_access_log;
CREATE POLICY "Service role can manage premium access log"
  ON public.premium_access_log FOR ALL
  TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert access attempts" ON public.access_attempts;
CREATE POLICY "Service role can insert access attempts"
  ON public.access_attempts FOR INSERT
  TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage admin emails" ON public.admin_emails;
CREATE POLICY "Service role can manage admin emails"
  ON public.admin_emails FOR ALL
  TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service role only" ON public.assessment_trial;
CREATE POLICY "Service role manages assessment trial"
  ON public.assessment_trial FOR ALL
  TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.security_audit_log;
CREATE POLICY "Service role can insert audit logs"
  ON public.security_audit_log FOR INSERT
  TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages face enrollments" ON public.face_enrollments;
CREATE POLICY "Service role manages face enrollments"
  ON public.face_enrollments FOR ALL
  TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access to Videos" ON storage.objects;
DROP POLICY IF EXISTS "Audio files are publicly accessible" ON storage.objects;

DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'update_updated_at_column()',
    'update_avatar_videos_updated_at()',
    'update_user_context_timestamp()',
    'update_persona_templates_updated_at()',
    'update_voice_templates_updated_at()',
    'update_main_persona_templates_updated_at()',
    'update_custom_persona_updated_at()',
    'update_email_templates_updated_at()',
    'sync_profile_from_subscription()',
    'backfill_talking_photo_on_avatar_change()',
    'log_premium_grant()',
    'initialize_user_subscription()',
    'minimal_onboarding_trigger()',
    '_email_to_bigint(text)'
  ]
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', fn);
  END LOOP;
END$$;
