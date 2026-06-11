import { Trophy, Eye, MousePointerClick, Clock, RotateCcw } from "lucide-react";

interface LeadScoreCardProps {
  score: number;
  breakdown: {
    views: number;
    clicks: number;
    time: number;
    repeats: number;
  };
  visitorId: string;
}

function getScoreLevel(score: number): { label: string; color: string; bg: string } {
  if (score >= 61) return { label: "Alto", color: "text-status-success", bg: "bg-status-success/10" };
  if (score >= 31) return { label: "Medio", color: "text-status-warning", bg: "bg-status-warning/10" };
  return { label: "Bajo", color: "text-status-destructive", bg: "bg-status-destructive/10" };
}

export function LeadScoreCard({ score, breakdown, visitorId }: LeadScoreCardProps) {
  const level = getScoreLevel(score);

  return (
    <div data-testid="lead-score-card" className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Score</span>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${level.color} ${level.bg}`}>
          {level.label}
        </div>
      </div>

      <div className="text-3xl font-bold" data-testid="score-value">
        {score}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Eye className="size-3" />
          <span>Vistas:</span>
          <span className="font-medium text-foreground">{breakdown.views}</span>
        </div>
        <div className="flex items-center gap-1">
          <MousePointerClick className="size-3" />
          <span>Clicks:</span>
          <span className="font-medium text-foreground">{breakdown.clicks}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="size-3" />
          <span>Tiempo:</span>
          <span className="font-medium text-foreground">{breakdown.time}s</span>
        </div>
        <div className="flex items-center gap-1">
          <RotateCcw className="size-3" />
          <span>Repeticiones:</span>
          <span className="font-medium text-foreground">{breakdown.repeats}</span>
        </div>
      </div>

      <div className="text-xs text-muted-foreground truncate">
        Visitor: {visitorId}
      </div>
    </div>
  );
}
