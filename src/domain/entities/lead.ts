export type EventType = "view" | "whatsapp_click" | "time_spent" | "repeat_visit";

export interface LeadEvent {
  id: string;
  visitorId: string;
  propertyId: string;
  eventType: EventType;
  metadata: Record<string, unknown>;
  createdAt: string;
}
