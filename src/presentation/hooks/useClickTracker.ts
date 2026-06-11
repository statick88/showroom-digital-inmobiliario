import { useCallback, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { metricasRepository } from "@/data/repositories";
import type { TipoEvento } from "@/domain/entities/propiedad";

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
  const sessionId = useRef<string | undefined>(undefined);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window !== "undefined" && sessionId.current === undefined) {
      sessionId.current = getOrCreateSessionId();
    }
  }, []);

  const trackMutation = useMutation({
    mutationFn: ({ propiedadId, tipoEvento }: { propiedadId: string; tipoEvento: TipoEvento }) =>
      metricasRepository.registrarClick({
        propiedadId,
        tipoEvento,
        sesionId: sessionId.current,
        paginaOrigen: typeof window !== "undefined" ? window.location.pathname : "/",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metricas"] });
      queryClient.invalidateQueries({ queryKey: ["top-clicks"] });
    },
  });

  const trackClick = useCallback(
    (propiedadId: string, tipoEvento: TipoEvento = "click") => {
      trackMutation.mutate({ propiedadId, tipoEvento });
    },
    [trackMutation],
  );

  return { trackClick, isTracking: trackMutation.isPending };
}
