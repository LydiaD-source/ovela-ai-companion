-- Create CRM leads table for Ovela contact capture
CREATE TABLE IF NOT EXISTS public.crm_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  inquiry_type TEXT NOT NULL,
  message TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'ovela',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

-- Admins can view all leads
CREATE POLICY "Admins can view all leads"
ON public.crm_leads
FOR SELECT
USING (is_admin_user());

-- Service role can insert leads
CREATE POLICY "Service role can insert leads"
ON public.crm_leads
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Admins can manage leads
CREATE POLICY "Admins can manage leads"
ON public.crm_leads
FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Create trigger for updated_at
CREATE TRIGGER update_crm_leads_updated_at
BEFORE UPDATE ON public.crm_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_crm_leads_source ON public.crm_leads(source);
CREATE INDEX idx_crm_leads_created_at ON public.crm_leads(created_at DESC);