"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
import { analyticsRepository } from "@/data/repositories";
import type { EventType, TourAnalyticsEvent } from "@/domain/entities/analytics";

const BUFFER_SIZE = 50;
const FLUSH_INTERVAL_MS = 5_000;
const VISITOR_KEY = "showroom-tour-visitor-id";

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export interface UseTourAnalyticsReturn {
  track: (
    eventType: EventType,
    metadata?: Record<string, unknown>,
    parcelId?: string,
  ) => void;
  flush: () => Promise<void>;
  visitorId: string;
}

export function useTourAnalytics(tourId: string): UseTourAnalyticsReturn {
  const bufferRef = useRef<TourAnalyticsEvent[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const visitorId = useMemo(() => getOrCreateVisitorId(), []);

  const flush = useCallback(async () => {
    if (bufferRef.current.length === 0) return;
    const events = [...bufferRef.current];
    bufferRef.current = [];
    try {
      await analyticsRepository.insertEvents(events);
    } catch {
      // Silently drop — analytics should never block the tour
    }
  }, []);

  const track = useCallback(
    (
      eventType: EventType,
      metadata: Record<string, unknown> = {},
      parcelId?: string,
    ) => {
      const event: TourAnalyticsEvent = {
        id: crypto.randomUUID(),
        event_type: eventType,
        tour_id: tourId,
        parcel_id: parcelId,
        visitor_id: visitorId,
        metadata,
        created_at: new Date().toISOString(),
      };
      bufferRef.current.push(event);

      if (bufferRef.current.length >= BUFFER_SIZE) {
        flush();
      }
    },
    [tourId, visitorId, flush],
  );

  // Periodic flush
  useEffect(() => {
    timerRef.current = setInterval(flush, FLUSH_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      flush();
    };
  }, [flush]);

  // Flush on page unload
  useEffect(() => {
    const handleUnload = () => {
      if (bufferRef.current.length === 0) return;
      try {
        const payload = JSON.stringify(bufferRef.current);
        navigator.sendBeacon?.(
          `${import.meta.env.VITE_SUPABASE_URL ?? ""}/rest/v1/analytics_events`,
          new Blob([payload], { type: "application/json" }),
        );
      } catch {
        // sendBeacon is best-effort
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  return { track, flush, visitorId };
}
