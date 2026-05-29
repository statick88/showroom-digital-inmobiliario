import { useState, useRef } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { leadsRepository } from "@/data/repositories";
import { env } from "@/config/env";
import type { Propiedad } from "@/domain/entities/propiedad";

const THROTTLE_MS = 30_000;

export function LeadForm({
  propiedad,
  open,
  onClose,
}: {
  propiedad: Propiedad | null;
  open: boolean;
  onClose: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const lastSubmit = useRef(0);

  if (!propiedad) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) return;
    if (!consent) {
      toast.warning("Consentimiento requerido", {
        description: "Acepta la política de privacidad para continuar.",
      });
      return;
    }

  if (!propiedad) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) return;

    const now = Date.now();
    if (now - lastSubmit.current < THROTTLE_MS) {
      toast.warning("Ya enviaste una solicitud recientemente", {
        description: "Espera un momento antes de intentar de nuevo.",
      });
      return;
    }

    if (env.turnstileSiteKey && !turnstileToken) {
      toast.warning("Verifica que no eres un robot", {
        description: "Completa el captcha para continuar.",
      });
      return;
    }

    setSaving(true);
    try {
      await leadsRepository.crear({
        propiedadId: propiedad.id,
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim() || undefined,
      });
      lastSubmit.current = now;
      toast.success("Solicitud enviada", {
        description: "Te contactaremos pronto sobre esta propiedad.",
      });
      setNombre("");
      setEmail("");
      setTelefono("");
      setConsent(false);
      setTurnstileToken(null);
      onClose();
    } catch (err) {
      console.error("[LeadForm] Error al enviar lead:", err);
      toast.error("Error al enviar", {
        description: "Intenta de nuevo más tarde.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogTitle>Contactar</DialogTitle>
        <DialogDescription>
          {propiedad.titulo} — {propiedad.codigo}
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">Nombre *</label>
            <Input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre completo"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">Email *</label>
            <Input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">Teléfono</label>
            <Input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+51 999 999 999"
            />
          </div>

          {env.turnstileSiteKey && (
            <Turnstile
              siteKey={env.turnstileSiteKey}
              onSuccess={setTurnstileToken}
              options={{
                theme: "light",
                size: "flexible",
              }}
            />
          )}

          {/* LPDP Consentimiento */}
          <label className="flex gap-2 items-start cursor-pointer">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 rounded border-outline-variant text-primary"
            />
            <span className="text-xs text-on-surface-variant leading-snug">
              He leído y acepto la <b>Política de Privacidad</b> según la Ley N° 29733 (Protección de Datos Personales del Perú).
            </span>
          </label>

          <Button type="submit" className="w-full" disabled={saving || (!consent || (!!env.turnstileSiteKey && !turnstileToken))}>
            {saving ? "Enviando..." : "Enviar solicitud"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
