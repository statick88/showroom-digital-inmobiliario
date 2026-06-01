"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent) return;

    const timer = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4">
      <div className="mx-auto max-w-2xl rounded-xl bg-card border border-border shadow-lg p-4 flex items-center gap-4">
        <p className="flex-1 text-sm text-foreground">
          Usamos cookies para mejorar tu experiencia
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            onClick={() => window.open("#privacidad", "_blank")}
          >
            Más información
          </button>
          <Button size="sm" onClick={handleAccept}>
            Aceptar
          </Button>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cerrar"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
