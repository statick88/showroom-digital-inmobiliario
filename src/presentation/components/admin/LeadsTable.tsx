import { useState } from "react";
import { useLeads } from "@/presentation/hooks/useLeads.legacy";
import type { Lead } from "@/domain/entities/propiedad";

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

function LeadDetail({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-card rounded-xl border border-border shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground text-lg leading-none"
          aria-label="Cerrar"
        >
          ✕
        </button>
        <h3 className="font-semibold text-lg text-foreground mb-4">Detalle del Lead</h3>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground text-xs">Nombre</dt>
            <dd className="text-foreground font-medium">{lead.nombre}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Email</dt>
            <dd className="text-foreground">{lead.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Teléfono</dt>
            <dd className="text-foreground">{lead.telefono ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Propiedad</dt>
            <dd className="text-foreground">
              {lead.propiedadCodigo && (
                <span className="text-primary font-medium">{lead.propiedadCodigo}</span>
              )}
              {lead.propiedadCodigo && lead.propiedadTitulo ? ": " : ""}
              {lead.propiedadTitulo}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Score</dt>
            <dd className="text-foreground font-medium">{lead.score}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">Notas</dt>
            <dd className="text-foreground">{lead.notas ?? "—"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export function LeadsTable() {
  const { data: leads, isLoading } = useLeads();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-modal">
        <div className="p-8 text-center text-sm text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-modal">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted">
              <tr>
                <th className="p-4 text-xs text-muted-foreground font-medium">Nombre</th>
                <th className="p-4 text-xs text-muted-foreground font-medium">Email</th>
                <th className="p-4 text-xs text-muted-foreground font-medium">Teléfono</th>
                <th className="p-4 text-xs text-muted-foreground font-medium">Propiedad</th>
                <th className="p-4 text-xs text-muted-foreground font-medium">Fecha</th>
                <th className="p-4 text-xs text-muted-foreground font-medium text-center">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leads && leads.length > 0 ? (
                leads.map((l) => (
                  <tr key={l.id} className="hover:bg-muted transition-colors">
                    <td className="p-4 text-sm text-foreground font-medium">{l.nombre}</td>
                    <td className="p-4 text-sm text-muted-foreground">{l.email}</td>
                    <td className="p-4 text-sm text-muted-foreground">{l.telefono ?? "—"}</td>
                    <td className="p-4 text-sm text-muted-foreground truncate max-w-[200px]">
                      {l.propiedadCodigo && (
                        <span className="text-primary font-medium">{l.propiedadCodigo}</span>
                      )}
                      {l.propiedadCodigo && l.propiedadTitulo ? ": " : ""}
                      {l.propiedadTitulo}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(l.createdAt)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedLead(l)}
                        className="px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                    No hay leads
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLead && <LeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} />}
    </>
  );
}
