CREATE TABLE public.assessment_trial (
  user_key text PRIMARY KEY,
  first_assessment_at timestamptz NOT NULL DEFAULT now(),
  assessment_count integer NOT NULL DEFAULT 1,
  last_assessment_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.assessment_trial TO service_role;

ALTER TABLE public.assessment_trial ENABLE ROW LEVEL SECURITY;

-- No public policies — only service_role (edge function) accesses this table.
CREATE POLICY "service role only"
  ON public.assessment_trial
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);