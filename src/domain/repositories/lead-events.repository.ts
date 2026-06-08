import type { LeadEvent, EventType } from "@/domain/entities/lead";

export interface LeadEventsRepository {
  registrar(data: {
    visitorId: string;
    propertyId: string;
    eventType: EventType;
    metadata?: Record<string, unknown>;
  }): Promise<LeadEvent>;
  listarPorVisitor(visitorId: string): Promise<LeadEvent[]>;
}
