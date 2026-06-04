-- ============================================================
-- SHOWROOM LOTIZACIÓN FASE 3 — LPDP retention purge
-- Migration: 00008
-- ============================================================
--
-- Background (decision #2664, spec #2668 GAP-4, design #2669):
--   LPDP (Ley 29733, Peru) requires that personal data be deleted
--   once the retention period expires — 5 years after the user gives
--   consent is the default safe value. This migration provides:
--
--   1. A `purga_lpd(retention_years INTEGER DEFAULT 5)` SQL function
--      that NULLs out PII fields on `public.leads` rows older than
--      the retention window, ONLY for rows where the user gave
--      consent (consent_timestamp IS NOT NULL).
--   2. An optional pg_cron schedule that runs the function on the
--      1st of every month at 03:00, gated by a pg_extension check so
--      the migration is safe on Supabase projects WITHOUT pg_cron.
--
-- Strategy decisions:
--   - Function uses `CREATE OR REPLACE` so re-running is a no-op.
--   - Function is `SECURITY DEFINER` so it can run from a pg_cron job
--     without an authenticated Supabase session.
--   - Function NULLs fields instead of DELETEing rows — preserves
--     referential integrity with `public.transacciones` and keeps
--     aggregate counts stable.
--   - PII fields purged: telefono, email, dni, cci, consent_ip,
--     user_agent, mensaje.
--   - Lead ID, proyecto_id, lote_id, created_at, and the consent
--     timestamp are RETAINED so we can still prove consent was given
--     and audit when the purge happened.
--
-- Rollback: DROP FUNCTION IF EXISTS public.purga_lpd(INTEGER);
--           DELETE FROM cron.job WHERE jobname = 'purga-lpd-monthly';
-- ============================================================

-- 1. FUNCTION: purga_lpd
CREATE OR REPLACE FUNCTION public.purga_lpd(retention_years INTEGER DEFAULT 5)
RETURNS TABLE (purged_id UUID, purged_at TIMESTAMPTZ) AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
BEGIN
  RETURN QUERY
  UPDATE public.leads
  SET
    telefono = NULL,
    email = NULL,
    dni = NULL,
    cci = NULL,
    consent_ip = NULL,
    user_agent = NULL,
    mensaje = NULL
  WHERE created_at < v_now - (retention_years || ' years')::INTERVAL
    AND consent_timestamp IS NOT NULL
  RETURNING id, v_now AS purged_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION public.purga_lpd(INTEGER) IS
  'Purges LPDP-sensitive PII (telefono, email, dni, cci, consent_ip, user_agent, mensaje) from leads older than retention_years (default 5). Only purges rows where the user gave consent (consent_timestamp IS NOT NULL). NULLs fields instead of DELETEing rows to preserve referential integrity with public.transacciones. SECURITY DEFINER so it can run from a scheduled job without an authenticated Supabase session. Idempotent: re-running purges the same eligible rows (idempotent NULL assignment).';

-- 2. OPTIONAL pg_cron SCHEDULE — guarded by extension check.
--    Hans Erik's Supabase project MAY NOT have pg_cron enabled. If
--    pg_cron is present, schedule a monthly run; otherwise log a
--    NOTICE so the operator knows to enable the extension or run the
--    function manually (see supabase/README-purga.md if/when added in
--    a follow-up PR).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Idempotent: only schedule if not already present.
    IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purga-lpd-monthly') THEN
      PERFORM cron.schedule(
        'purga-lpd-monthly',
        '0 3 1 * *',
        $cmd$SELECT public.purga_lpd(5);$cmd$
      );
      RAISE NOTICE 'pg_cron job scheduled: purga-lpd-monthly at 03:00 on day 1 of every month';
    ELSE
      RAISE NOTICE 'pg_cron job purga-lpd-monthly already exists — skipping schedule';
    END IF;
  ELSE
    RAISE NOTICE 'pg_cron extension not enabled on this database; function public.purga_lpd(5) is callable on demand. To enable automated scheduling, enable the pg_cron extension in the Supabase dashboard and re-run this migration.';
  END IF;
END $$;
