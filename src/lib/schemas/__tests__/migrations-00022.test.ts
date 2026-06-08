import { describe, it, expect } from "vitest";

/**
 * File-content tests for `supabase/migrations/00022_lead_scores.sql`.
 *
 * Validates structural properties of the migration:
 * 1. lead_scores table created with correct columns
 * 2. Score constraint enforces 0-100 range
 * 3. visitor_id is UNIQUE
 * 4. RPC function compute_lead_score exists
 * 5. RPC returns baseline 10 for no events
 * 6. RPC caps score at 100
 */

import migrationSql from "../../../../supabase/migrations/00022_lead_scores.sql?raw";

describe("migration 00022_lead_scores.sql", () => {
  it("(1) creates lead_scores table", () => {
    expect(migrationSql).toMatch(/CREATE\s+TABLE\s+lead_scores/i);
  });

  it("(2) has id, visitor_id, score, breakdown, computed_at columns", () => {
    expect(migrationSql).toMatch(/id\s+UUID\s+PRIMARY\s+KEY/i);
    expect(migrationSql).toMatch(/visitor_id\s+TEXT/i);
    expect(migrationSql).toMatch(/score\s+INTEGER/i);
    expect(migrationSql).toMatch(/breakdown\s+JSONB/i);
    expect(migrationSql).toMatch(/computed_at\s+TIMESTAMPTZ/i);
  });

  it("(3) constrains score to 0-100 range", () => {
    expect(migrationSql).toMatch(/CHECK\s*\(\s*score\s*>=\s*0/i);
    expect(migrationSql).toMatch(/score\s*<=\s*100/i);
  });

  it("(4) makes visitor_id UNIQUE", () => {
    expect(migrationSql).toMatch(/visitor_id\s+TEXT\s+UNIQUE/i);
  });

  it("(5) creates compute_lead_score RPC function", () => {
    expect(migrationSql).toMatch(/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+compute_lead_score/i);
    expect(migrationSql).toMatch(/p_visitor_id\s+TEXT/i);
    expect(migrationSql).toMatch(/RETURNS\s+INTEGER/i);
  });

  it("(6) RPC function queries lead_events for views, clicks, time, repeats", () => {
    expect(migrationSql).toMatch(/event_type\s*=\s*'view'/i);
    expect(migrationSql).toMatch(/event_type\s*=\s*'whatsapp_click'/i);
    expect(migrationSql).toMatch(/event_type\s*=\s*'time_spent'/i);
    expect(migrationSql).toMatch(/event_type\s*=\s*'repeat_visit'/i);
  });

  it("(7) RPC uses GREATEST(10, ...) for baseline score", () => {
    expect(migrationSql).toMatch(/GREATEST\s*\(\s*10/i);
  });

  it("(8) RPC uses LEAST(100, ...) to cap score", () => {
    expect(migrationSql).toMatch(/LEAST\s*\(\s*100/i);
  });

  it("(9) creates index on score descending", () => {
    expect(migrationSql).toMatch(/CREATE\s+INDEX/i);
    expect(migrationSql).toMatch(/idx_lead_scores_score/i);
    expect(migrationSql).toMatch(/ON\s+lead_scores\s*\(\s*score\s+DESC/i);
  });

  it("(10) weights: views*10, clicks*25, time/3, repeats*15", () => {
    expect(migrationSql).toMatch(/v_views\s*\*\s*10/);
    expect(migrationSql).toMatch(/v_clicks\s*\*\s*25/);
    expect(migrationSql).toMatch(/\/\s*3/);
    expect(migrationSql).toMatch(/v_repeats\s*\*\s*15/);
  });
});
