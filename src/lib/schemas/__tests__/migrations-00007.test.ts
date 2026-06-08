import { describe, it, expect } from "vitest";

/**
 * File-content tests for `supabase/migrations/00007_cci_validation.sql`.
 *
 * The project has no pg-mem or in-process Postgres available, so we cannot
 * execute the migration. Instead we assert the structural properties of the
 * file that encode the design decisions from spec #2668 and design #2669:
 *
 * 1. Pre-check NOTICEs dirty CCI count BEFORE applying the CHECK
 *    (proves safe handling of legacy data — design risk #3).
 * 2. CHECK uses `NOT VALID` (proves the constraint is added without
 *    validating existing rows, so the migration is idempotent on dirty data
 *    and never fails on legacy values).
 * 3. Constraint name is `cci_format_check` (spec #2668 verification
 *    step, line 188).
 * 4. Regex matches the spec format `^002-\d{18}$` (spec #2668 line 550 +
 *    design #2669 line 164).
 * 5. Idempotency: the constraint add is guarded by a `pg_constraint`
 *    existence check, so re-running the migration is a no-op.
 *
 * The SQL file is loaded as a raw string via vite's `?raw` query — this
 * avoids `node:fs` imports so the test stays compatible with the
 * project's vite-only tsconfig types.
 */

import migrationSql from "../../../../supabase/migrations/00010_cci_validation.sql?raw";

describe("migration 00010_cci_validation.sql", () => {
  it("(1) raises NOTICE with the count of dirty CCI rows BEFORE the CHECK", () => {
    const sql = migrationSql;

    // Pre-check NOTICE must reference the spec regex (so it counts the same
    // set of rows that the CHECK would later reject).
    expect(sql).toMatch(/RAISE\s+NOTICE/i);

    // The dirty-count query must be present.
    expect(sql).toMatch(/count\(\s*\*\s*\)/i);
    expect(sql).toMatch(/FROM\s+public\.leads/i);

    // The spec regex (0007 must use the same pattern as the CHECK).
    // SQL uses the POSIX character class `[0-9]{18}` (equivalent to JS `\d{18}`).
    expect(sql).toMatch(/\^002-\[0-9\]\{18\}\$/);

    // The NOTICE block must come BEFORE the ALTER TABLE in the file
    // (we approximate by checking the NOTICE appears in the first half
    // of the file as a coarse ordering check).
    const noticeIdx = sql.search(/RAISE\s+NOTICE/i);
    const alterIdx = sql.search(/ALTER\s+TABLE\s+public\.leads/i);
    expect(noticeIdx).toBeGreaterThan(-1);
    expect(alterIdx).toBeGreaterThan(-1);
    expect(noticeIdx).toBeLessThan(alterIdx);
  });

  it("(2) uses NOT VALID on the CCI CHECK so legacy data does not block the migration", () => {
    const sql = migrationSql;

    // The CHECK must be `NOT VALID` so existing dirty rows don't fail the
    // ADD CONSTRAINT statement.
    expect(sql).toMatch(/ADD\s+CONSTRAINT\s+cci_format_check/i);
    expect(sql).toMatch(/CHECK\s*\(/i);
    expect(sql).toMatch(/NOT\s+VALID/i);
  });

  it("(3) uses the spec'd constraint name `cci_format_check`", () => {
    const sql = migrationSql;
    // Spec #2668 line 188: `SELECT count(*) FROM information_schema.
    // check_constraints WHERE constraint_name = 'cci_format_check'`.
    expect(sql).toMatch(/cci_format_check/);
  });

  it("(4) enforces the spec CCI regex `^002-\\d{18}$` (002- prefix + 18 digits)", () => {
    const sql = migrationSql;

    // The CHECK predicate must use the same regex as the Zod schema
    // (spec #2668 line 550 + design #2669 line 164). SQL uses
    // `[0-9]{18}` (POSIX) which is equivalent to JS `\d{18}`.
    expect(sql).toMatch(/cci\s+~\s*'\^002-\[0-9\]\{18\}\$'/);
  });

  it("(5) is idempotent — guards the ADD CONSTRAINT with a pg_constraint existence check", () => {
    const sql = migrationSql;

    // Idempotency: the ADD CONSTRAINT must be inside a DO block that checks
    // pg_constraint for the constraint name first.
    expect(sql).toMatch(/DO\s+\$\$/i);
    expect(sql).toMatch(/pg_constraint/i);
    expect(sql).toMatch(/conname\s*=\s*'cci_format_check'/i);
  });
});
