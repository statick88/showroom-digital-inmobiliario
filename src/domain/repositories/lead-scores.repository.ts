import type { LeadScore } from "@/domain/entities/lead";

export interface LeadScoresRepository {
  compute(visitorId: string): Promise<LeadScore>;
  getByVisitor(visitorId: string): Promise<LeadScore | null>;
  listTopScores(limit?: number): Promise<LeadScore[]>;
}
