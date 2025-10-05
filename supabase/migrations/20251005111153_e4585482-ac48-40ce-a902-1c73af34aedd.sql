-- User Consents Table
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  privacy_policy_version TEXT NOT NULL,
  terms_of_service_version TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  consent_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_consents
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_consents' AND policyname = 'Users can read own consents'
  ) THEN
    CREATE POLICY "Users can read own consents"
      ON public.user_consents
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_consents' AND policyname = 'Users can insert own consents'
  ) THEN
    CREATE POLICY "Users can insert own consents"
      ON public.user_consents
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_consents' AND policyname = 'Service role can manage user_consents'
  ) THEN
    CREATE POLICY "Service role can manage user_consents"
      ON public.user_consents
      FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON public.user_consents(user_id);