ALTER TABLE public.assessment_trial 
  ADD COLUMN IF NOT EXISTS assessment_type text,
  ADD COLUMN IF NOT EXISTS language text;

CREATE INDEX IF NOT EXISTS idx_assessment_trial_type ON public.assessment_trial(assessment_type);
CREATE INDEX IF NOT EXISTS idx_assessment_trial_language ON public.assessment_trial(language);