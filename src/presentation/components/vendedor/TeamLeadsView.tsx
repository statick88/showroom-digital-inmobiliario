"use client";

import { useTopLeadScores } from "@/presentation/hooks/useLeadScoring";

function getScoreLabel(score: number): { label: string; className: string } {
  if (score >= 61) return { label: "Alto", className: "bg-green-100 text-green-800" };
  if (score >= 31) return { label: "Medio", className: "bg-yellow-100 text-yellow-800" };
  return { label: "Bajo", className: "bg-red-100 text-red-800" };
}

export function TeamLeadsView() {
  const { data: leads, isLoading } = useTopLeadScores(20);

  if (isLoading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Cargando leads...
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Sin leads registrados
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => {
        const { label, className } = getScoreLabel(lead.score);
        return (
          <div
            key={lead.id}
            className="flex items-center justify-between rounded-lg border border-border p-3"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {lead.visitorId}
              </p>
              <p className="text-xs text-muted-foreground">
                {lead.breakdown.views} vistas · {lead.breakdown.clicks} clics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">
                {lead.score}
              </span>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
