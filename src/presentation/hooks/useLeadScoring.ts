import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadScoresRepository } from "@/data/repositories";

export function useLeadScoring(visitorId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["lead-score", visitorId],
    queryFn: () => leadScoresRepository.getByVisitor(visitorId!),
    enabled: !!visitorId,
  });

  const computeMutation = useMutation({
    mutationFn: (vid: string) => leadScoresRepository.compute(vid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-score", visitorId] });
    },
  });

  return {
    ...query,
    computeScore: () =>
      visitorId ? computeMutation.mutateAsync(visitorId) : Promise.resolve(null),
  };
}

export function useTopLeadScores(limit?: number) {
  return useQuery({
    queryKey: ["lead-scores-top", limit],
    queryFn: () => leadScoresRepository.listTopScores(limit),
  });
}
