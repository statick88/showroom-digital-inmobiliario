import { useCallback, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { leadEventsRepository } from "@/data/repositories";

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

export function useWhatsApp(
  propertyName: string,
  price: number,
  phone: string,
  propertyId: string,
) {
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
        propertyId,
        eventType: "whatsapp_click",
        metadata: { propertyName, price },
      }),
  });

  const openWhatsApp = useCallback(() => {
    const message = `Hola, me interesa "${propertyName}" a S/${price}. ¿Podría darme más información?`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    trackClick.mutate();
  }, [propertyName, price, phone, trackClick]);

  return { openWhatsApp, isTracking: trackClick.isPending };
}
