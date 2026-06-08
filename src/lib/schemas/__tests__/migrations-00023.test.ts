import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const migrationPath = join(
  process.cwd(),
  "supabase/migrations/00023_commissions.sql",
);

function readMigration(): string {
  return readFileSync(migrationPath, "utf-8");
}

describe("migration 00023 — commissions tables", () => {
  it("creates commission_rules table", () => {
    const sql = readMigration();
    expect(sql).toContain("CREATE TABLE");
    expect(sql).toContain("commission_rules");
  });

  it("creates vendedor_commissions table", () => {
    const sql = readMigration();
    expect(sql).toContain("vendedor_commissions");
  });

  it("creates invoices table", () => {
    const sql = readMigration();
    expect(sql).toContain("invoices");
  });

  it("enables RLS on vendedor_commissions", () => {
    const sql = readMigration();
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("vendedor_commissions");
  });

  it("creates RLS policy for vendedor own commissions", () => {
    const sql = readMigration();
    expect(sql).toContain("CREATE POLICY");
    expect(sql).toContain("vendedor_id = auth.uid()");
  });

  it("commission_rules has percentage constraint", () => {
    const sql = readMigration();
    expect(sql).toContain("percentage");
    expect(sql).toContain("CHECK");
  });

  it("vendedor_commissions has status constraint", () => {
    const sql = readMigration();
    expect(sql).toContain("pending");
    expect(sql).toContain("approved");
    expect(sql).toContain("paid");
  });

  it("invoices references vendedor_commissions", () => {
    const sql = readMigration();
    expect(sql).toContain("REFERENCES vendedor_commissions");
  });

  it("creates indexes for performance", () => {
    const sql = readMigration();
    expect(sql).toContain("CREATE INDEX");
  });

  it("inserts default commission rules", () => {
    const sql = readMigration();
    expect(sql).toContain("INSERT INTO");
    expect(sql).toContain("commission_rules");
  });
});
