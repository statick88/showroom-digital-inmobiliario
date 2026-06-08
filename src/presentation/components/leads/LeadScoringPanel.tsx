import { Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { leadScoresRepository } from "@/data/repositories";
import { LeadScoreCard } from "./LeadScoreCard";

interface LeadScoringPanelProps {
  limit?: number;
}

export function LeadScoringPanel({ limit = 20 }: LeadScoringPanelProps) {
  const { data: scores, isLoading } = useQuery({
    queryKey: ["lead-scores-top", limit],
    queryFn: () => leadScoresRepository.listTopScores(limit),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Lead Scoring</h2>
      </div>

      {isLoading && (
        <div className="text-sm text-muted-foreground py-8 text-center">
          Cargando leads...
        </div>
      )}

      {!isLoading && scores && scores.length === 0 && (
        <div className="text-sm text-muted-foreground py-8 text-center">
          Sin leads registrados
        </div>
      )}

      {!isLoading && scores && scores.length > 0 && (
        <div className="grid gap-3">
          {scores.map((score) => (
            <LeadScoreCard
              key={score.id}
              score={score.score}
              breakdown={score.breakdown}
              visitorId={score.visitorId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
