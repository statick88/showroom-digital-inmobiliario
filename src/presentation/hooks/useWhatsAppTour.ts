import { useCallback, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { leadEventsRepository } from "@/data/repositories";
import type { Lote } from "@/domain/entities/lote";

const SESSION_KEY = "showroom-session-id";

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/**
 * Build a WhatsApp tour message containing parcel details and a deep link.
 * Pure function — testable without React.
 */
export function buildTourMessage(lote: Lote, tourId: string): string {
  const price = lote.moneda === "PEN"
    ? `S/ ${lote.precio.toLocaleString("es-PE")}`
    : `$ ${lote.precio.toLocaleString("es-PE")}`;
  const tourLink = `${window.location.origin}?tour=${tourId}#parcel=${lote.codigo}`;
  return `Hola, me interesa el lote "${lote.codigo}" (${lote.areaTotal} m²) a ${price}. ${tourLink}`;
}

/**
 * Wraps useWhatsApp with tour context.
 * Appends a tour deep link (`?tour={tourId}#parcel={code}`) to the message.
 * Respects `lote.moneda` for price formatting (PEN→S/, USD→$).
 * Delegates tracking to the existing useWhatsApp mutation.
 */
export function useWhatsAppTour(lote: Lote, tourId: string) {
  const visitorId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== "undefined" && visitorId.current === undefined) {
      visitorId.current = getOrCreateVisitorId();
    }
  }, []);

  const trackClick = useMutation({
    mutationFn: () =>
      leadEventsRepository.registrar({
        visitorId: visitorId.current ?? "anonymous",
        propertyId: lote.id,
        eventType: "whatsapp_click",
        metadata: { propertyName: lote.codigo, price: lote.precio },
      }),
  });

  const openWhatsApp = useCallback(() => {
    const message = buildTourMessage(lote, tourId);
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    trackClick.mutate();
  }, [lote, tourId, trackClick]);

  return { openWhatsApp, isTracking: trackClick.isPending };
}
