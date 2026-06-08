export type EventType = "view" | "whatsapp_click" | "time_spent" | "repeat_visit";

export interface LeadEvent {
  id: string;
  visitorId: string;
  propertyId: string;
  eventType: EventType;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface LeadScore {
  id: string;
  visitorId: string;
  score: number; // 0-100
  breakdown: {
    views: number;
    clicks: number;
    time: number;
    repeats: number;
  };
  computedAt: string;
}
