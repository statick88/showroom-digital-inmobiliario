import { supabase } from "@/lib/supabase/client";
import { rethrowIfPresent } from "@/lib/supabase/errors";
import type {
  TourAnalyticsEvent,
  AnalyticsAggregate,
  AnalyticsSummary,
} from "@/domain/entities/analytics";

export interface AnalyticsRepository {
  insertEvents(events: TourAnalyticsEvent[]): Promise<void>;
  getAggregates(
    tourId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<AnalyticsSummary>;
}

function mapAggregate(row: Record<string, unknown>): AnalyticsAggregate {
  return {
    parcel_id: row.parcel_id as string,
    parcel_code: row.parcel_code as string,
    total_clicks: Number(row.total_clicks) || 0,
    whatsapp_clicks: Number(row.whatsapp_clicks) || 0,
    share_clicks: Number(row.share_clicks) || 0,
  };
}

export const analyticsRepository: AnalyticsRepository = {
  async insertEvents(events) {
    if (events.length === 0) return;

    const { error } = await supabase
      .from("analytics_events")
      .insert(
        events.map((e) => ({
          id: e.id,
          event_type: e.event_type,
          tour_id: e.tour_id,
          parcel_id: e.parcel_id ?? null,
          visitor_id: e.visitor_id,
          metadata: e.metadata,
          created_at: e.created_at,
        }))
      );

    rethrowIfPresent(error, "Error al insertar eventos de analytics");
  },

  async getAggregates(tourId, dateRange) {
    const { data, error } = await supabase.rpc("get_analytics_summary", {
      p_tour_id: tourId,
      p_start: dateRange.start.toISOString(),
      p_end: dateRange.end.toISOString(),
    });

    rethrowIfPresent(error, "Error al obtener resumen de analytics");

    const rows = (data ?? []) as Record<string, unknown>[];

    return {
      total_visitors: 0,
      total_events: rows.reduce(
        (sum, r) => sum + (Number(r.total_clicks) || 0), 0
      ),
      parcel_aggregates: rows.map(mapAggregate),
    };
  },
};
