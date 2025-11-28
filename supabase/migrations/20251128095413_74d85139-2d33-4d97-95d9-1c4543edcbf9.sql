-- Enable RLS on user_subscriptions_backup table (subscription and payment data)
ALTER TABLE public.user_subscriptions_backup ENABLE ROW LEVEL SECURITY;

-- Add admin-only access policy for user_subscriptions_backup
CREATE POLICY "Only admins can access subscription backups"
ON public.user_subscriptions_backup
FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());