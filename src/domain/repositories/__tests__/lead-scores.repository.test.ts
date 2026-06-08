import { describe, it, expectTypeOf } from "vitest";
import type { LeadScoresRepository } from "@/domain/repositories/lead-scores.repository";
import type { LeadScore } from "@/domain/entities/lead";

describe("LeadScoresRepository interface (PR-3) — contract", () => {
  it("has compute method that returns Promise<LeadScore>", () => {
    expectTypeOf<LeadScoresRepository["compute"]>().toEqualTypeOf<
      (visitorId: string) => Promise<LeadScore>
    >();
  });

  it("has getByVisitor method that returns Promise<LeadScore | null>", () => {
    expectTypeOf<LeadScoresRepository["getByVisitor"]>().toEqualTypeOf<
      (visitorId: string) => Promise<LeadScore | null>
    >();
  });

  it("has listTopScores method that returns Promise<LeadScore[]>", () => {
    expectTypeOf<LeadScoresRepository["listTopScores"]>().toEqualTypeOf<
      (limit?: number) => Promise<LeadScore[]>
    >();
  });
});
