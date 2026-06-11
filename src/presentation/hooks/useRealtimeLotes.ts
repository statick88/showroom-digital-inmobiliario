import { useQueryClient } from "@tanstack/react-query";
import { useRealtimeSubscription } from "./useRealtimeSubscription";

/**
 * Subscribes to realtime changes on the `lotes` table.
 * Invalidates the React Query `["lotes"]` cache when any
 * INSERT / UPDATE / DELETE occurs, keeping the admin UI in sync.
 */
export function useRealtimeLotes() {
  const queryClient = useQueryClient();

  return useRealtimeSubscription({
    channel: "lotes-realtime",
    table: "lotes",
    event: "*",
    onPayload: () => {
      queryClient.invalidateQueries({ queryKey: ["lotes"] });
    },
  });
}
