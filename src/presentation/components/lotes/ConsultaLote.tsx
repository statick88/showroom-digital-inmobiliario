import { useState } from "react";
import { toast } from "sonner";
import type { Lote } from "@/domain/entities/lote";
import { Icon } from "@/components/ui/icon";
import { useCrearTransaccion } from "@/presentation/hooks/useTransacciones";

interface ConsultaLoteProps {
  lote: Lote;
  onClose: () => void;
}

export function ConsultaLote({ lote, onClose }: ConsultaLoteProps) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const { mutateAsync: crearTransaccion, isPending } = useCrearTransaccion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !correo.trim() || !telefono.trim()) return;

    try {
      await crearTransaccion({
        loteId: lote.id,
        tipo: "reserva",
        compradorNombre: nombre.trim(),
        compradorEmail: correo.trim(),
        compradorTelefono: telefono.trim(),
        monto: lote.precio,
        moneda: lote.moneda,
      });

      toast.success("Consulta enviada");
      onClose();
    } catch (error) {
      toast.error("No se pudo enviar la consulta", {
        description: error instanceof Error ? error.message : "Intenta de nuevo más tarde.",
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Consultar lote"
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="typo-headline-md text-foreground">Consultar {lote.codigo}</h3>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="typo-label-md text-muted-foreground mb-2">
              Déjanos tus datos y te contactaremos sobre este lote.
            </p>
          </div>
          <div>
            <label htmlFor="consulta-nombre" className="typo-label-md text-foreground block mb-1">Nombre</label>
            <input
              id="consulta-nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground typo-body-md outline-none focus:border-primary transition-colors"
              placeholder="Tu nombre"
              required
            />
          </div>
          <div>
            <label htmlFor="consulta-correo" className="typo-label-md text-foreground block mb-1">Correo</label>
            <input
              id="consulta-correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground typo-body-md outline-none focus:border-primary transition-colors"
              placeholder="tu@correo.com"
              required
            />
          </div>
          <div>
            <label htmlFor="consulta-telefono" className="typo-label-md text-foreground block mb-1">Teléfono</label>
            <input
              id="consulta-telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground typo-body-md outline-none focus:border-primary transition-colors"
              placeholder="999 999 999"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold typo-label-md hover:brightness-110 transition-all"
          >
            Enviar consulta
          </button>
        </form>
      </div>
    </div>
  );
}
