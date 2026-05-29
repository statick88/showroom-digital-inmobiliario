"use client";

import { useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { metricasRepository } from "@/data/repositories";

const SESSION_KEY = "showroom-session-id";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function useClickTracker() {
  const sessionId = useRef<string | null>(null);
  if (typeof window !== "undefined" && sessionId.current === null) {
    sessionId.current = getOrCreateSessionId();
  }
  const queryClient = useQueryClient();

  const trackMutation = useMutation({
    mutationFn: (propiedadId: string) =>
      metricasRepository.registrarClick({
        propiedadId,
        tipoEvento: "click",
        sesionId: sessionId.current,
        paginaOrigen: typeof window !== "undefined" ? window.location.pathname : "/",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metricas"] });
      queryClient.invalidateQueries({ queryKey: ["top-clicks"] });
    },
  });

  const trackClick = useCallback((propiedadId: string) => {
    trackMutation.mutate(propiedadId);
  }, [trackMutation]);

  return { trackClick, isTracking: trackMutation.isPending };
}