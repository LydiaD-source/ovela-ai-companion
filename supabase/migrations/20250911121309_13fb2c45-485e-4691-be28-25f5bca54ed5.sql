-- Create Ovela client in the clients table
INSERT INTO public.clients (name, status, contact_info) 
VALUES (
  'Ovela Interactive',
  'active',
  '{"company": "Ovela Interactive", "type": "wellness_platform", "description": "AI-powered wellness and interactive platform"}'::jsonb
);

-- Create API key for Ovela client
WITH ovela_client AS (
  SELECT id FROM public.clients WHERE name = 'Ovela Interactive'
)
INSERT INTO public.api_keys (client_id, key_prefix, key_hash, scopes)
SELECT 
  ovela_client.id,
  'ovela',
  generate_api_key(),
  '["chat", "wellness", "geni_integration"]'::jsonb
FROM ovela_client;