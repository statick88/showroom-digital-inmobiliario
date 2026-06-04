-- ============================================================
-- SHOWROOM LOTIZACIÓN FASE 3 — CCI format validation
-- Migration: 00007
-- ============================================================
--
-- Background (design #2669 risk #3):
--   `leads.cci` was added in 00004_cci_field.sql without a format
--   constraint, so legacy rows may contain non-conforming values.
--   The pilot's CCI is a 23-character string: prefix "002-" + 18 digits
--   (spec #2668 line 550). This migration adds a CHECK constraint in
--   NOT VALID mode so the migration never fails on existing dirty
--   rows; a follow-up migration (PR-3+) VALIDATEs the constraint after
--   Diego cleans dirty data in the Supabase dashboard.
--
-- Strategy:
--   1. RAISE NOTICE the dirty-row count BEFORE the ALTER so the operator
--      sees the volume of non-conforming rows in the migration log.
--   2. ADD CONSTRAINT ... CHECK ... NOT VALID — does not scan existing
--      rows, so the migration succeeds on dirty data.
--   3. Guarded by a pg_constraint existence check so re-running the
--      migration is a no-op (idempotency).
--
-- Rollback: ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS cci_format_check;
-- ============================================================

-- 1. PRE-CHECK: count dirty CCI rows so the operator sees the count in
--    the migration log before the constraint is added.
DO $$
DECLARE
  v_dirty_leads INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_dirty_leads
  FROM public.leads
  WHERE cci IS NOT NULL
    AND cci !~ '^002-[0-9]{18}$';

  RAISE NOTICE 'CCI data quality: % leads.cci rows do NOT match ^002-[0-9]{18}$ (will NOT block this migration because CHECK is added NOT VALID)',
    v_dirty_leads;
END $$;

-- 2. ADD CONSTRAINT (idempotent, NOT VALID).
--    NOT VALID skips the full-table scan against existing rows. The
--    constraint is enforced for all NEW inserts/updates. A future
--    migration can `ALTER TABLE ... VALIDATE CONSTRAINT cci_format_check;`
--    once the dirty rows have been cleaned.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cci_format_check'
      AND conrelid = 'public.leads'::regclass
  ) THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT cci_format_check
      CHECK (cci IS NULL OR cci ~ '^002-[0-9]{18}$')
      NOT VALID;
    RAISE NOTICE 'Added CHECK constraint cci_format_check on public.leads (NOT VALID)';
  ELSE
    RAISE NOTICE 'CHECK constraint cci_format_check on public.leads already exists — skipping';
  END IF;
END $$;

-- 3. COMMENT documenting the constraint and the NOT VALID strategy.
COMMENT ON CONSTRAINT cci_format_check ON public.leads IS
  'CCI must be 20 digits prefixed with 002- (format 002-XXXXXXXXXXXXXXXX-XX) or NULL. Added NOT VALID because legacy leads.cci data may have non-conforming values; a follow-up migration VALIDATEs the constraint after manual cleanup of dirty rows.';
