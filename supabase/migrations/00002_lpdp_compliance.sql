-- ============================================================
-- SHOWROOM DIGITAL INMOBILIARIO — LPDP Compliance
-- ============================================================

-- Add consent-related columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS consent_timestamp timestamptz,
ADD COLUMN IF NOT EXISTS consent_ip inet,
ADD COLUMN IF NOT EXISTS user_agent text;

-- Add comment to explain the purpose
COMMENT ON COLUMN public.leads.consent_timestamp IS 'Timestamp when user checked privacy consent checkbox (ISO 8601)';
COMMENT ON COLUMN public.leads.consent_ip IS 'Anonymized IP address (last octet set to .0)';
COMMENT ON COLUMN public.leads.user_agent IS 'Browser user agent string';

-- Create index for querying consent data
CREATE INDEX IF NOT EXISTS idx_leads_consent_timestamp ON public.leads(consent_timestamp);