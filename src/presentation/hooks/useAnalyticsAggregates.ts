import { useQuery } from "@tanstack/react-query";
import { analyticsRepository } from "@/data/repositories";
import type {
  AnalyticsAggregate,
  AnalyticsSummary,
} from "@/domain/entities/analytics";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface UseAnalyticsAggregatesReturn {
  summary: AnalyticsSummary;
  topParcels: AnalyticsAggregate[];
  eventTypeBreakdown: { type: string; count: number }[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

function defaultDateRange(): DateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return { start, end };
}

export function useAnalyticsAggregates(
  tourId: string,
  dateRange?: DateRange,
): UseAnalyticsAggregatesReturn {
  const range = dateRange ?? defaultDateRange();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["analytics-aggregates", tourId, range.start.toISOString(), range.end.toISOString()],
    queryFn: () => analyticsRepository.getAggregates(tourId, range),
    enabled: Boolean(tourId),
    staleTime: 60_000,
  });

  const summary: AnalyticsSummary = data ?? {
    total_visitors: 0,
    total_events: 0,
    parcel_aggregates: [],
  };

  const topParcels = summary.parcel_aggregates;

  // Derive event type breakdown from aggregates
  const eventTypeBreakdown = topParcels.length > 0
    ? [
        { type: "Parcel Clicks", count: topParcels.reduce((s, p) => s + p.total_clicks, 0) },
        { type: "WhatsApp", count: topParcels.reduce((s, p) => s + p.whatsapp_clicks, 0) },
        { type: "Share", count: topParcels.reduce((s, p) => s + p.share_clicks, 0) },
      ]
    : [];

  return {
    summary,
    topParcels,
    eventTypeBreakdown,
    isLoading,
    isError,
    error,
    refetch,
  };
}
