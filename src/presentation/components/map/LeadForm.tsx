"use client";

import { useState, useEffect, useCallback } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { env } from "@/config/env";
import { leadsRepository } from "@/data/repositories/leads.repository.impl";
import type { Propiedad } from "@/domain/entities/propiedad";

const THROTTLE_KEY = "lead_submit_ts";
const THROTTLE_MS = 30_000;

interface LeadFormProps {
  onClose: () => void;
  propiedad: Pick<Propiedad, "id" | "codigo">;
}

function isThrottled(): boolean {
  try {
    const last = localStorage.getItem(THROTTLE_KEY);
    if (!last) return false;
    return Date.now() - Number(last) < THROTTLE_MS;
  } catch {
    return false;
  }
}

function setThrottle(): void {
  try {
    localStorage.setItem(THROTTLE_KEY, String(Date.now()));
  } catch {
    // localStorage not available
  }
}

function getRemainingSeconds(): number {
  try {
    const last = localStorage.getItem(THROTTLE_KEY);
    if (!last) return 0;
    const remaining = Math.ceil((THROTTLE_MS - (Date.now() - Number(last))) / 1000);
    return Math.max(0, remaining);
  } catch {
    return 0;
  }
}

export function LeadForm({ onClose, propiedad }: LeadFormProps) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [throttled, setThrottled] = useState(() => isThrottled());
  const [throttleCountdown, setThrottleCountdown] = useState(() =>
    isThrottled() ? getRemainingSeconds() : 0,
  );

  // Countdown timer
  useEffect(() => {
    if (!throttled || throttleCountdown <= 0) return;
    const timer = setInterval(() => {
      const remaining = getRemainingSeconds();
      if (remaining <= 0) {
        setThrottled(false);
        setThrottleCountdown(0);
        clearInterval(timer);
      } else {
        setThrottleCountdown(remaining);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [throttled, throttleCountdown]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (throttled) return;
      if (!nombre.trim() || !email.trim()) return;
      if (!turnstileToken) {
        toast.error("Verificación requerida", {
          description: "Completa la verificación de seguridad.",
        });
        return;
      }
      if (!privacyAccepted) {
        toast.error("Aceptación requerida", {
          description: "Debes aceptar la Política de Privacidad.",
        });
        return;
      }

      setSubmitting(true);
      try {
        // Anonymize IP: get the last octet and replace
        let consentIp: string | undefined;
        try {
          const rtcResp = await fetch("https://checkip.amazonaws.com");
          const ip = (await rtcResp.text()).trim();
          const parts = ip.split(".");
          if (parts.length === 4) {
            parts[3] = "0";
            consentIp = parts.join(".");
          }
        } catch {
          // IP anonymization failed silently
        }

        await leadsRepository.crear({
          propiedadId: propiedad.id,
          nombre: nombre.trim(),
          email: email.trim(),
          telefono: telefono.trim() || undefined,
          consent_timestamp: new Date().toISOString(),
          consent_ip: consentIp,
          user_agent: navigator.userAgent,
        });

        setThrottle();
        setThrottled(true);
        setThrottleCountdown(30);

        toast.success("Solicitud enviada", {
          description: "Nos pondremos en contacto contigo pronto.",
        });

        setTimeout(() => {
          onClose();
        }, 2000);
      } catch (err) {
        toast.error("Error al enviar", {
          description: err instanceof Error ? err.message : "Intenta de nuevo más tarde.",
        });
      } finally {
        setSubmitting(false);
      }
    },
    [nombre, email, telefono, turnstileToken, privacyAccepted, throttled, propiedad.id, onClose],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-xl bg-card shadow-modal overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Formulario de contacto"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full bg-black/30 p-1.5 text-white hover:bg-black/50 transition-colors"
          aria-label="Cerrar"
        >
          <X className="size-4" />
        </button>

        {/* Header */}
        <div className="p-6 pb-2">
          <h2 className="text-lg font-bold text-foreground">Solicitar información</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {propiedad.codigo && <>Propiedad: {propiedad.codigo}</>}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
          {/* Nombre */}
          <div className="flex flex-col gap-1">
            <label htmlFor="lead-nombre" className="text-sm font-medium text-foreground">
              Nombre <span className="text-destructive">*</span>
            </label>
            <input
              id="lead-nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre completo"
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring transition-all"
              disabled={submitting}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label htmlFor="lead-email" className="text-sm font-medium text-foreground">
              Email <span className="text-destructive">*</span>
            </label>
            <input
              id="lead-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring transition-all"
              disabled={submitting}
            />
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-1">
            <label htmlFor="lead-telefono" className="text-sm font-medium text-foreground">
              Teléfono <span className="text-muted-foreground">(opcional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                +51
              </span>
              <input
                id="lead-telefono"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="999 999 999"
                className="w-full h-10 pl-11 pr-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring transition-all"
                disabled={submitting}
              />
            </div>
          </div>

          {/* Turnstile Captcha */}
          {env.turnstileSiteKey && (
            <div className="flex justify-center">
              <Turnstile
                siteKey={env.turnstileSiteKey}
                onSuccess={setTurnstileToken}
                options={{
                  theme: "auto",
                }}
              />
            </div>
          )}

          {/* Privacy consent */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              className="mt-0.5 size-4 rounded border-border text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
              disabled={submitting}
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              He leído y acepto la{" "}
              <a
                href="#privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                Política de Privacidad
              </a>{" "}
              según Ley N° 29733
            </span>
          </label>

          {/* Throttle message */}
          {throttled && (
            <p className="text-xs text-muted-foreground text-center">
              Puedes enviar una solicitud cada 30 segundos
              {throttleCountdown > 0 && <> — espera {throttleCountdown}s</>}
            </p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={
              submitting ||
              throttled ||
              !nombre.trim() ||
              !email.trim() ||
              !turnstileToken ||
              !privacyAccepted
            }
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar solicitud"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
