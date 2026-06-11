"use client";

import {
  QueryClient,
  QueryClientProvider,
  PersistQueryClientProvider,
} from "@tanstack/react-query";
import { createIDBPersister } from "@tanstack/query-persist-client-core";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { OfflineQueue } from "@/lib/offline-queue";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  const [persister] = useState(
    () =>
      createIDBPersister({
        idbOptions: {
          dbName: "showroom-query-cache",
          version: 1,
        },
        key: "react-query",
        throttleTime: 1000,
        serializer: {
          serialize: (data) => JSON.stringify(data),
          deserialize: (data) => JSON.parse(data),
        },
        filter: (mutation) => {
          const queryKey = mutation.queryKey;
          if (!Array.isArray(queryKey)) return false;
          return (
            queryKey[0] === "lotes" || queryKey[0] === "virtual-tours"
          );
        },
      }),
  );

  useEffect(() => {
    const handleOnline = async () => {
      const pending = await OfflineQueue.getAll();
      for (const item of pending) {
        try {
          await queryClient.invalidateQueries({ queryKey: [item.hook] });
          await OfflineQueue.remove(item.id);
        } catch {
          // Keep in queue for next online event
        }
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [queryClient]);

  return (
    <PersistQueryClientProvider client={queryClient} persister={persister}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </PersistQueryClientProvider>
  );
}