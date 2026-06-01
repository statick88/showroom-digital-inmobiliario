"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRealtimeSubscription } from "./useRealtimeSubscription";

/**
 * Subscribes to realtime changes on the `propiedades` table.
 * Invalidates the React Query `["propiedades"]` cache when any
 * INSERT / UPDATE / DELETE occurs, keeping the UI in sync.
 */
export function useRealtimePropiedades() {
  const queryClient = useQueryClient();

  return useRealtimeSubscription({
    channel: "propiedades-realtime",
    table: "propiedades",
    event: "*",
    onPayload: () => {
      queryClient.invalidateQueries({ queryKey: ["propiedades"] });
    },
  });
}
