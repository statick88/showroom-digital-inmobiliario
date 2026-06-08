import { supabase } from "@/lib/supabase/client";
import { rethrowIfPresent } from "@/lib/supabase/errors";
import type { LeadScoresRepository } from "@/domain/repositories/lead-scores.repository";
import type { LeadScore } from "@/domain/entities/lead";

function mapLeadScore(row: Record<string, unknown>): LeadScore {
  return {
    id: row.id as string,
    visitorId: row.visitor_id as string,
    score: row.score as number,
    breakdown: (row.breakdown as LeadScore["breakdown"]) ?? {
      views: 0,
      clicks: 0,
      time: 0,
      repeats: 0,
    },
    computedAt: row.computed_at as string,
  };
}

export const leadScoresRepository: LeadScoresRepository = {
  async compute(visitorId: string) {
    const { data: score, error: rpcError } = await supabase.rpc("compute_lead_score", {
      p_visitor_id: visitorId,
    });

    rethrowIfPresent(rpcError, "Error al computing lead score");

    const { data, error: upsertError } = await supabase
      .from("lead_scores")
      .upsert(
        {
          visitor_id: visitorId,
          score: score as number,
          breakdown: {},
          computed_at: new Date().toISOString(),
        },
        { onConflict: "visitor_id" },
      )
      .select("*")
      .single();

    rethrowIfPresent(upsertError, "Error al guardar lead score");
    return mapLeadScore(data as Record<string, unknown>);
  },

  async getByVisitor(visitorId: string) {
    const { data, error } = await supabase
      .from("lead_scores")
      .select("*")
      .eq("visitor_id", visitorId)
      .single();

    if (error?.code === "PGRST116") return null;
    rethrowIfPresent(error, "Error al cargar lead score");
    return data ? mapLeadScore(data as Record<string, unknown>) : null;
  },

  async listTopScores(limit = 50) {
    const { data, error } = await supabase
      .from("lead_scores")
      .select("*")
      .order("score", { ascending: false })
      .limit(limit);

    rethrowIfPresent(error, "Error al cargar lead scores");
    return (data ?? []).map((row) => mapLeadScore(row as Record<string, unknown>));
  },
};
