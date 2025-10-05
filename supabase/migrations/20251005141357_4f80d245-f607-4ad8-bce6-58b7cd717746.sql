-- =====================================================
-- SECURITY FIX: Restrict access to authorized_users table
-- This migration fixes the critical vulnerability where email addresses
-- are exposed to the public internet
-- =====================================================

-- Step 1: Create a security definer function to check authorization
-- This allows checking authorization without exposing email addresses
CREATE OR REPLACE FUNCTION public.check_email_authorized(check_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.authorized_users 
    WHERE email = check_email 
      AND is_active = true
  );
$$;

-- Step 2: Drop the insecure public SELECT policy
DROP POLICY IF EXISTS "Anyone can check if email is authorized" ON public.authorized_users;

-- Step 3: Add admin-only SELECT policy
CREATE POLICY "Admins can view all authorized users"
ON public.authorized_users
FOR SELECT
TO authenticated
USING (is_admin_user());

-- Step 4: Allow authenticated users to check if their own email is authorized
CREATE POLICY "Users can check their own email authorization"
ON public.authorized_users
FOR SELECT
TO authenticated
USING (email = (auth.jwt() ->> 'email'));