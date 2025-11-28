-- Enable RLS on profiles_backup table (contains sensitive PII)
ALTER TABLE public.profiles_backup ENABLE ROW LEVEL SECURITY;

-- Add admin-only access policy for profiles_backup
CREATE POLICY "Only admins can access profiles backup"
ON public.profiles_backup
FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Enable RLS on did_streaming_diagnostics table (could leak API credentials)
ALTER TABLE public.did_streaming_diagnostics ENABLE ROW LEVEL SECURITY;

-- Add admin-only access policy for did_streaming_diagnostics
CREATE POLICY "Only admins can access DID diagnostics"
ON public.did_streaming_diagnostics
FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Allow service role to manage diagnostic logs
CREATE POLICY "Service role can manage DID diagnostics"
ON public.did_streaming_diagnostics
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');