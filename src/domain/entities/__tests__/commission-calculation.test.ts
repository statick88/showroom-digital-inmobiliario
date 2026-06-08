import { describe, it, expect } from "vitest";
import { calculateCommission } from "@/domain/entities/commission";
import type { CommissionRule } from "@/domain/entities/commission";

describe("calculateCommission (PR-4) — pure function", () => {
  const rules: CommissionRule[] = [
    {
      id: "rule-1",
      minPrice: 0,
      maxPrice: 200000,
      percentage: 1.5,
      description: "Base tier",
      active: true,
    },
    {
      id: "rule-2",
      minPrice: 200001,
      maxPrice: 500000,
      percentage: 2.0,
      description: "Mid tier",
      active: true,
    },
    {
      id: "rule-3",
      minPrice: 500001,
      maxPrice: null,
      percentage: 2.5,
      description: "Premium tier",
      active: true,
    },
  ];

  it("calculates 1.5% commission for price in base tier (S/ 150,000)", () => {
    const result = calculateCommission(150000, rules);
    expect(result).toBe(2250);
  });

  it("calculates 2% commission for price in mid tier (S/ 400,000)", () => {
    const result = calculateCommission(400000, rules);
    expect(result).toBe(8000);
  });

  it("calculates 2.5% commission for price in premium tier (S/ 800,000)", () => {
    const result = calculateCommission(800000, rules);
    expect(result).toBe(20000);
  });

  it("returns 0 when no rules match", () => {
    const result = calculateCommission(100000, []);
    expect(result).toBe(0);
  });

  it("handles exact boundary: price equals minPrice of a rule", () => {
    const result = calculateCommission(200001, rules);
    expect(result).toBe(4000.02);
  });

  it("handles exact boundary: price equals maxPrice of a rule", () => {
    const result = calculateCommission(500000, rules);
    expect(result).toBe(10000);
  });

  it("handles open-ended rule (maxPrice = null) for very high prices", () => {
    const result = calculateCommission(5000000, rules);
    expect(result).toBe(125000);
  });

  it("returns 0 for price 0", () => {
    const result = calculateCommission(0, rules);
    expect(result).toBe(0);
  });

  it("filters out inactive rules — only uses active ones", () => {
    const activeOnlyRules: CommissionRule[] = [
      {
        id: "rule-inactive",
        minPrice: 0,
        maxPrice: 1000000,
        percentage: 5.0,
        description: "Inactive",
        active: false,
      },
      {
        id: "rule-active",
        minPrice: 0,
        maxPrice: 1000000,
        percentage: 1.0,
        description: "Active",
        active: true,
      },
    ];
    const result = calculateCommission(500000, activeOnlyRules);
    expect(result).toBe(5000);
  });
});
