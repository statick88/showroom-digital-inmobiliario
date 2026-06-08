"use client";

import { useAuthStore } from "@/presentation/hooks/useAuthStore";
import { useCommissions } from "@/presentation/hooks/useCommissions";
import { CommissionTable } from "@/presentation/components/vendedor/CommissionTable";
import { TeamLeadsView } from "@/presentation/components/vendedor/TeamLeadsView";

function formatPEN(amount: number): string {
  return `S/ ${amount.toLocaleString("es-PE")}`;
}

export function VendedorDashboard() {
  const { nombre, id } = useAuthStore();
  const { data: commissions } = useCommissions(id ?? undefined);

  const totalCommissions = commissions?.length ?? 0;
  const totalAmount = commissions?.reduce((sum, c) => sum + c.commissionAmount, 0) ?? 0;
  const pendingCount = commissions?.filter((c) => c.status === "pending").length ?? 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-4 md:px-8">
        <div>
          <h1 className="typo-headline-md font-bold text-foreground">
            Dashboard Vendedor
          </h1>
          <p className="typo-label-md text-muted-foreground">
            {nombre ?? "Vendedor"}
          </p>
        </div>
      </header>

      {/* Commission Summary */}
      <section className="border-b border-border px-4 py-6 md:px-8">
        <h2 className="typo-headline-sm mb-4 font-semibold text-foreground">
          Resumen de Comisiones
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground">{totalCommissions}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">Monto Total</p>
            <p className="text-2xl font-bold text-foreground">
              {formatPEN(totalAmount)}
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">Pendientes</p>
            <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
          </div>
        </div>
      </section>

      {/* Team Leads */}
      <section className="border-b border-border px-4 py-6 md:px-8">
        <h2 className="typo-headline-sm mb-4 font-semibold text-foreground">
          Leads del Equipo
        </h2>
        <TeamLeadsView />
      </section>

      {/* Commissions Table */}
      <section className="flex-grow px-4 py-6 md:px-8">
        <h2 className="typo-headline-sm mb-4 font-semibold text-foreground">
          Comisiones
        </h2>
        {id && <CommissionTable vendedorId={id} />}
      </section>
    </div>
  );
}
