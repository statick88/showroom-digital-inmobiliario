"use client";

import { useTopLeadScores } from "@/presentation/hooks/useLeadScoring";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

function getScoreLabel(score: number): { label: string; className: string } {
  if (score >= 61) return { label: "Alto", className: "bg-status-success/10 text-status-success" };
  if (score >= 31) return { label: "Medio", className: "bg-status-warning/10 text-status-warning" };
  return { label: "Bajo", className: "bg-status-destructive/10 text-status-destructive" };
}

export function TeamLeadsView() {
  const { data: leads, isLoading } = useTopLeadScores(20);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="space-y-2 flex-grow">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-8" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <EmptyState
        title="Sin leads registrados"
        description="Los leads aparecerán aquí cuando los visitantes interactúen con las propiedades."
      />
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
