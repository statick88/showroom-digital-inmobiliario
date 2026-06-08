import { describe, it, expect } from "vitest";

/**
 * File-content tests for `supabase/migrations/00008_purga_lpd_function.sql`.
 *
 * The project has no pg-mem or in-process Postgres available, so we cannot
 * execute the migration. Instead we assert the structural properties that
 * encode the design decisions from spec #2668, design #2669, and the
 * orchestrator's launch prompt for PR-2 (T-2.2):
 *
 * 1. The function is `CREATE OR REPLACE` (idempotent — re-running the
 *    migration is a no-op when the function already exists).
 * 2. The function returns TABLE with columns `purged_id` and `purged_at`
 *    (so the caller can audit which rows were touched).
 * 3. The pg_cron block is wrapped in an `IF EXISTS pg_extension` guard
 *    (Hans Erik's Supabase project may not have pg_cron enabled —
 *    design risk #3, decision #2664).
 * 4. The default `retention_years` parameter is 5 (per Ley 29733 /
 *    LPDP Peru — 5 years is the statutory data retention maximum for
 *    personal data after consent is withdrawn).
 * 5. The retention filter includes `consent_timestamp IS NOT NULL`
 *    (NEVER purge leads where the user did not give consent in the
 *    first place — design risk #4 + LPDP article 13).
 * 6. The function is `SECURITY DEFINER` so it can run from a scheduled
 *    job without an authenticated session.
 * 7. The function NULLs out PII fields (telefono, email, dni, cci,
 *    consent_ip, user_agent, mensaje) — does not DELETE the row, to
 *    preserve referential integrity with transactions.
 *
 * The SQL file is loaded as a raw string via vite's `?raw` query — this
 * avoids `node:fs` imports so the test stays compatible with the
 * project's vite-only tsconfig types.
 */

import migrationSql from "../../../../supabase/migrations/00011_purga_lpd_function.sql?raw";

describe("migration 00011_purga_lpd_function.sql", () => {
  it("(1) declares the purga_lpd function with CREATE OR REPLACE (idempotent)", () => {
    const sql = migrationSql;

    expect(sql).toMatch(/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+(public\.)?purga_lpd\b/i);

    // The function must accept a retention_years parameter.
    expect(sql).toMatch(/retention_years\s+INTEGER/i);
  });

  it("(2) returns TABLE with purged_id and purged_at for auditability", () => {
    const sql = migrationSql;

    // RETURNS TABLE clause
    expect(sql).toMatch(/RETURNS\s+TABLE\s*\(/i);

    // Required columns
    expect(sql).toMatch(/purged_id\s+UUID/i);
    expect(sql).toMatch(/purged_at\s+TIMESTAMPTZ/i);
  });

  it("(3) guards the pg_cron block with IF EXISTS pg_extension (handles missing extension)", () => {
    const sql = migrationSql;

    // The pg_cron schedule must be inside a guard so it does not throw
    // if the extension is not enabled on this Supabase project.
    expect(sql).toMatch(/pg_extension/i);
    expect(sql).toMatch(/extname\s*=\s*'pg_cron'/i);
    expect(sql).toMatch(/cron\.schedule/i);

    // The guard must wrap the cron.schedule call (use DO $$ BEGIN ... IF ... END IF; END $$;
    // is the canonical pattern).
    expect(sql).toMatch(/IF\s+EXISTS/i);
  });

  it("(4) defaults retention_years to 5 (LPDP Peru — Ley 29733 art. 13)", () => {
    const sql = migrationSql;

    expect(sql).toMatch(/retention_years\s+INTEGER\s+DEFAULT\s+5/i);
  });

  it("(5) only purges leads with consent_timestamp IS NOT NULL (skip unconsented rows)", () => {
    const sql = migrationSql;

    // The retention filter must include the consent gate so that leads
    // that never consented are NOT purged (they have no lawful basis to
    // hold anyway, but the function should not silently drop them).
    expect(sql).toMatch(/consent_timestamp\s+IS\s+NOT\s+NULL/i);
  });

  it("(6) declares the function SECURITY DEFINER so it can run from pg_cron without an auth session", () => {
    const sql = migrationSql;

    expect(sql).toMatch(/SECURITY\s+DEFINER/i);
  });

  it("(7) NULLs out PII fields (telefono, email, dni, cci, consent_ip, user_agent, mensaje) instead of DELETE", () => {
    const sql = migrationSql;

    // Each PII field must be set to NULL.
    expect(sql).toMatch(/telefono\s*=\s*NULL/i);
    expect(sql).toMatch(/email\s*=\s*NULL/i);
    expect(sql).toMatch(/dni\s*=\s*NULL/i);
    expect(sql).toMatch(/cci\s*=\s*NULL/i);
    expect(sql).toMatch(/consent_ip\s*=\s*NULL/i);
    expect(sql).toMatch(/user_agent\s*=\s*NULL/i);
    expect(sql).toMatch(/mensaje\s*=\s*NULL/i);
  });
});
