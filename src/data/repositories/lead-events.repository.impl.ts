import { supabase } from "@/lib/supabase/client";
import { rethrowIfPresent } from "@/lib/supabase/errors";
import type { LeadEventsRepository } from "@/domain/repositories/lead-events.repository";
import type { LeadEvent } from "@/domain/entities/lead";

function mapLeadEvent(row: Record<string, unknown>): LeadEvent {
  return {
    id: row.id as string,
    visitorId: row.visitor_id as string,
    propertyId: row.property_id as string,
    eventType: row.event_type as LeadEvent["eventType"],
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
  };
}

export const leadEventsRepository: LeadEventsRepository = {
  async registrar({ visitorId, propertyId, eventType, metadata }) {
    const { data, error } = await supabase
      .from("lead_events")
      .insert({
        visitor_id: visitorId,
        property_id: propertyId,
        event_type: eventType,
        metadata: metadata ?? {},
      })
      .select("*")
      .single();

    rethrowIfPresent(error, "Error al registrar evento de lead");
    return mapLeadEvent(data as Record<string, unknown>);
  },

  async listarPorVisitor(visitorId: string) {
    const { data, error } = await supabase
      .from("lead_events")
      .select("*")
      .eq("visitor_id", visitorId)
      .order("created_at", { ascending: false });

    rethrowIfPresent(error, "Error al cargar eventos de lead");
    return (data ?? []).map((row) => mapLeadEvent(row as Record<string, unknown>));
  },
};
