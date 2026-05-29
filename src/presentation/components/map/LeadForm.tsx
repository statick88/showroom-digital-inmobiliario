"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { leadsRepository } from "@/data/repositories";
import type { Propiedad } from "@/domain/entities/propiedad";

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
  const [saving, setSaving] = useState(false);

  if (!propiedad) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) return;

    setSaving(true);
    try {
      await leadsRepository.crear({
        propiedadId: propiedad.id,
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim() || undefined,
      });
      toast.success("Solicitud enviada", {
        description: "Te contactaremos pronto sobre esta propiedad.",
      });
      setNombre("");
      setEmail("");
      setTelefono("");
      onClose();
    } catch {
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

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Enviando..." : "Enviar solicitud"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
