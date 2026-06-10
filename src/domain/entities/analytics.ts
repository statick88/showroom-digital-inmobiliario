export type EventType =
  | "parcel_click"
  | "tour_start"
  | "tour_end"
  | "whatsapp_click"
  | "share_click";

export interface TourAnalyticsEvent {
  id: string;
  event_type: EventType;
  tour_id: string;
  parcel_id?: string;
  visitor_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AnalyticsAggregate {
  parcel_id: string;
  parcel_code: string;
  total_clicks: number;
  whatsapp_clicks: number;
  share_clicks: number;
}

export interface AnalyticsSummary {
  total_visitors: number;
  total_events: number;
  parcel_aggregates: AnalyticsAggregate[];
}
