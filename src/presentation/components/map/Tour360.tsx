"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";

interface Tour360Props {
  imagenes: string[];
  titulo?: string;
  onClose?: () => void;
}

declare global {
  interface Window {
    pannellum: {
      viewer: (container: string, config: Record<string, unknown>) => { destroy: () => void };
    };
  }
}

export function Tour360({ imagenes, titulo, onClose }: Tour360Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    if (!document.querySelector("script[data-pannellum]")) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js";
      script.dataset.pannellum = "";
      document.head.appendChild(script);
    }

    if (!document.querySelector("link[data-pannellum-css]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css";
      link.dataset.pannellumCss = "";
      document.head.appendChild(link);
    }

    const checkPannellum = setInterval(() => {
      if (window.pannellum && containerRef.current && imagenes.length > 0) {
        clearInterval(checkPannellum);
        viewerRef.current = window.pannellum.viewer(containerRef.current.id, {
          type: "equirectangular",
          panorama: imagenes[0],
          autoLoad: true,
          autoRotate: -2,
          compass: true,
          showZoomCtrl: true,
          keyboardZoom: true,
          mouseZoom: true,
        });
      }
    }, 200);

    return () => {
      clearInterval(checkPannellum);
      viewerRef.current?.destroy();
    };
  }, [imagenes]);

  if (imagenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-[400px] bg-muted rounded-xl">
        <Icon name="360" size={48} className="text-muted-foreground/40" />
        <p className="typo-body-md text-muted-foreground">
          Tour 360° no disponible
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {titulo && <h3 className="typo-headline-md text-foreground">{titulo}</h3>}
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <Icon name="close" size={20} />
          </button>
        )}
      </div>
      <div
        id="panorama-container"
        ref={containerRef}
        className="w-full h-[500px] rounded-xl overflow-hidden border border-border"
      />
    </div>
  );
}
