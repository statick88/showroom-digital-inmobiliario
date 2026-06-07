-- ============================================================
-- SHOWROOM DIGITAL INMOBILIARIO — CCI Field for Separation
-- ============================================================

-- Add CCI column to leads table for tracking interbank account codes
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS cci varchar(20);

-- Add comment to explain the purpose
COMMENT ON COLUMN public.leads.cci IS 'Código de Cuenta Interbancario (CCI) for property separation transactions';