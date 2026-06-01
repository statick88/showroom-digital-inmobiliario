"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export type RealtimeEvent = "*" | "INSERT" | "UPDATE" | "DELETE";

export interface RealtimeSubscriptionOptions {
  /** Unique channel name e.g. "propiedades-changes" */
  channel: string;
  /** Table name e.g. "propiedades" */
  table: string;
  /** Optional filter e.g. "eq.proyecto_id=abc" */
  filter?: string;
  /** Event type to listen for. Defaults to "*" */
  event?: RealtimeEvent;
  /** Called when a matching postgres change payload arrives */
  onPayload: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
}

/**
 * Generic hook that subscribes to Supabase realtime `postgres_changes`.
 *
 * - Calls `supabase.channel().on('postgres_changes', ...).subscribe()` on mount
 * - Calls `.unsubscribe()` on unmount
 * - Does NOT auto-resubscribe on re-renders (stable deps only)
 */
export function useRealtimeSubscription({
  channel,
  table,
  filter,
  event = "*",
  onPayload,
}: RealtimeSubscriptionOptions) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Keep a ref to the callback so it doesn't trigger re-subscription
  const onPayloadRef = useRef(onPayload);
  useEffect(() => {
    onPayloadRef.current = onPayload;
  });

  useEffect(() => {
    const channelInstance = supabase
      .channel(channel)
      .on<Record<string, unknown>>(
        "postgres_changes",
        {
          event,
          schema: "public",
          table,
          ...(filter ? { filter } : {}),
        },
        (payload) => {
          onPayloadRef.current(payload as unknown as RealtimePostgresChangesPayload<Record<string, unknown>>);
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsSubscribed(true);
          setError(null);
        } else if (status === "CHANNEL_ERROR") {
          setIsSubscribed(false);
          setError(new Error(`Channel error: ${channel}`));
        } else if (status === "TIMED_OUT") {
          setIsSubscribed(false);
          setError(new Error(`Subscription timed out: ${channel}`));
        } else if (status === "CLOSED") {
          setIsSubscribed(false);
        }
      });

    return () => {
      channelInstance.unsubscribe();
    };
    // Stable deps only — callback via ref, no re-subscription on re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, table, filter, event]);

  return { isSubscribed, error };
}
