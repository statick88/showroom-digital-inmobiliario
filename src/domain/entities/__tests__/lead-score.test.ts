import { describe, it, expectTypeOf } from "vitest";
import type { LeadScore } from "@/domain/entities/lead";

describe("LeadScore entity (PR-3) — type-level sanity", () => {
  it("LeadScore has required fields with correct types", () => {
    expectTypeOf<LeadScore>().toHaveProperty("id");
    expectTypeOf<LeadScore>().toHaveProperty("visitorId");
    expectTypeOf<LeadScore>().toHaveProperty("score");
    expectTypeOf<LeadScore>().toHaveProperty("breakdown");
    expectTypeOf<LeadScore>().toHaveProperty("computedAt");

    expectTypeOf<LeadScore["id"]>().toBeString();
    expectTypeOf<LeadScore["visitorId"]>().toBeString();
    expectTypeOf<LeadScore["score"]>().toBeNumber();
    expectTypeOf<LeadScore["computedAt"]>().toBeString();
  });

  it("LeadScore.breakdown has views, clicks, time, repeats as numbers", () => {
    expectTypeOf<LeadScore["breakdown"]>().toHaveProperty("views");
    expectTypeOf<LeadScore["breakdown"]>().toHaveProperty("clicks");
    expectTypeOf<LeadScore["breakdown"]>().toHaveProperty("time");
    expectTypeOf<LeadScore["breakdown"]>().toHaveProperty("repeats");

    expectTypeOf<LeadScore["breakdown"]["views"]>().toBeNumber();
    expectTypeOf<LeadScore["breakdown"]["clicks"]>().toBeNumber();
    expectTypeOf<LeadScore["breakdown"]["time"]>().toBeNumber();
    expectTypeOf<LeadScore["breakdown"]["repeats"]>().toBeNumber();
  });
});
