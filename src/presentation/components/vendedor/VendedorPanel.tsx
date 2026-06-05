"use client";

/**
 * `<VendedorPanel>` — seller's workspace shell (T-4.2).
 *
 * Layout:
 *   ┌────────────────────────────────────────┐
 *   │  Header: seller name + proyecto        │
 *   ├────────────────────────────────────────┤
 *   │  MapaLotes                             │
 *   ├────────────────────────────────────────┤
 *   │  MetricasPanel                         │
 *   ├────────────────────────────────────────┤
 *   │  TransaccionesList (50/page, es-PE)    │  ← T-4.5 fills this
 *   └────────────────────────────────────────┘
 *
 * The panel does NOT do its own role-checking. The route handler
 * wraps it in `<RoleGuard rol="vendedor">`.
 */

import { useState, useEffect, Suspense, lazy } from "react";
import { useAuthStore } from "@/presentation/hooks/useAuthStore";
import { useProyecto } from "@/presentation/hooks/useProyectos";
import { env } from "@/config/env";
import { MapaLotes } from "@/presentation/components/lotes/MapaLotes";
import { MetricasPanel } from "@/presentation/components/map/MetricasPanel";
import { TransaccionesList } from "@/presentation/components/vendedor/TransaccionesList";
import type { Lote } from "@/domain/entities/lote";

const FichaTecnicaLote = lazy(() =>
  import("@/presentation/components/lotes/FichaTecnicaLote").then((m) => ({
    default: m.FichaTecnicaLote,
  })),
);

export function VendedorPanel() {
  const { nombre, rol, id } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);

  const proyectoId = env.proyectoId;
  const { data: proyecto } = useProyecto(proyectoId);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ── Header ───────────────────────────────────────────── */}
      <header
        data-testid="vendedor-header"
        className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-border bg-card"
      >
        <div>
          <h1 className="typo-headline-md font-bold text-foreground">Panel Vendedor</h1>
          <p className="typo-label-md text-muted-foreground">
            {nombre ?? "Vendedor"}{" "}
            {rol && (
              <span className="ml-2 inline-block rounded-full bg-accent px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent-foreground">
                {rol}
              </span>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="typo-label-md text-muted-foreground">Proyecto</p>
          <p className="typo-body-md font-semibold text-foreground">{proyecto?.nombre ?? "—"}</p>
        </div>
      </header>

      {/* ── Map ──────────────────────────────────────────────── */}
      <section
        aria-label="Mapa de lotes"
        className="h-[420px] md:h-[480px] border-b border-border overflow-hidden"
      >
        <MapaLotes onLoteClick={setSelectedLote} modoVendedor={true} />
      </section>

      {/* ── Metrics ──────────────────────────────────────────── */}
      <section className="px-4 md:px-8 py-6 border-b border-border">
        <h2 className="typo-headline-sm font-semibold text-foreground mb-4">Resumen</h2>
        <MetricasPanel />
      </section>

      {/* ── Transacciones (T-4.5) ────────────────────────────── */}
      <section className="px-4 md:px-8 py-6 flex-grow">
        <h2 className="typo-headline-sm font-semibold text-foreground mb-4">Mis transacciones</h2>
        <TransaccionesList vendedorId={id} />
      </section>

      {/* Mobile bottom safe area (unused at the moment; mirrors AdminDashboard pattern) */}
      {isMobile && <div className="h-20 md:hidden" />}

      {/* T-4.4: ficha opens in vendor mode (Reservar / Vender / Marcar Disponible). */}
      {selectedLote && (
        <Suspense fallback={null}>
          <FichaTecnicaLote
            lote={selectedLote}
            onClose={() => setSelectedLote(null)}
            modoVendedor={true}
          />
        </Suspense>
      )}
    </div>
  );
}
