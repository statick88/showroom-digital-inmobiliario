"use client";

/**
 * `<UsuariosPanel>` — admin user management table (T-5.1, HU-009).
 *
 * Renders the rows of `public.usuarios_rol` (admin / vendedor / comprador)
 * in a paginated table. The form dialogs (create + edit) are wired in via
 * T-5.2 (`CrearVendedorDialog`) and T-5.3 (`EditarVendedorDialog`); for T-5.1
 * we ship the table skeleton + empty state + the open-dialog plumbing.
 *
 * Design notes:
 *   - Source of truth is `useUsuarios()` (T-4.1). The hook holds the
 *     `["usuarios"]` query key so any create / edit / delete invalidates
 *     and re-fetches in one place.
 *   - This panel is rendered inside `<AdminDashboard>` and is the
 *     "Usuarios" tab on the desktop sidebar / mobile bottom bar.
 *   - The "Desactivar" button per row is wired in T-5.3 — for T-5.1 the
 *     button is present in the row but its onClick is a placeholder that
 *     will be replaced when `useDesactivarVendedor` lands.
 */

import { useState } from "react";
import { useUsuarios } from "@/presentation/hooks/useUsuarios";
import { CrearVendedorDialog } from "@/presentation/components/admin/CrearVendedorDialog";
import { EditarVendedorDialog } from "@/presentation/components/admin/EditarVendedorDialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { VendedorProfile } from "@/domain/entities/vendedor";

const PAGE_SIZE = 25;

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const rolBadgeClass: Record<VendedorProfile["rol"], string> = {
  admin: "bg-primary/10 text-primary",
  vendedor: "bg-accent text-accent-foreground",
  comprador: "bg-muted text-muted-foreground",
};

const rolLabel: Record<VendedorProfile["rol"], string> = {
  admin: "Admin",
  vendedor: "Vendedor",
  comprador: "Comprador",
};

export function UsuariosPanel() {
  const { data: usuarios, isLoading } = useUsuarios();
  const [page, setPage] = useState(0);
  const [crearOpen, setCrearOpen] = useState(false);
  const [editarOpen, setEditarOpen] = useState(false);
  const [selectedVendedor, setSelectedVendedor] = useState<VendedorProfile | null>(null);

  const totalRows = usuarios?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const pageRows = (usuarios ?? []).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleEdit = (v: VendedorProfile) => {
    setSelectedVendedor(v);
    setEditarOpen(true);
  };

  if (isLoading) {
    return (
      <div
        data-testid="usuarios-skeleton"
        className="space-y-2 rounded-xl border border-border bg-muted/30 p-4"
        aria-label="Cargando usuarios"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-full animate-pulse rounded-md bg-muted"
            data-testid="skeleton-row"
          />
        ))}
      </div>
    );
  }

  if (totalRows === 0) {
    return (
      <div className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Usuarios</h2>
            <p className="text-sm text-muted-foreground">
              Gestiona los vendedores, administradores y compradores del sistema
            </p>
          </div>
          <Button
            onClick={() => setCrearOpen(true)}
            className="flex items-center gap-2"
            data-testid="crear-vendedor-button"
          >
            <Icon name="add" size={18} />
            Crear vendedor
          </Button>
        </header>
        <div
          data-testid="usuarios-empty"
          className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center"
        >
          <p className="typo-body-md text-muted-foreground">
            No hay usuarios registrados. Crea el primer vendedor para empezar.
          </p>
        </div>
        <CrearVendedorDialog open={crearOpen} onOpenChange={setCrearOpen} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Usuarios</h2>
          <p className="text-sm text-muted-foreground">
            {totalRows} usuario{totalRows === 1 ? "" : "s"} registrado
            {totalRows === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          onClick={() => setCrearOpen(true)}
          className="flex items-center gap-2"
          data-testid="crear-vendedor-button"
        >
          <Icon name="add" size={18} />
          Crear vendedor
        </Button>
      </header>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left typo-body-sm" data-testid="usuarios-table">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Rol</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Creado</th>
              <th className="px-4 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((u) => (
              <tr
                key={u.id}
                data-testid="usuario-row"
                data-vendedor-id={u.id}
                className="border-t border-border hover:bg-muted/50"
              >
                <td className="px-4 py-3 font-medium text-foreground">{u.email}</td>
                <td className="px-4 py-3 text-foreground">{u.nombre}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-block rounded-full px-2 py-0.5 text-xs font-semibold uppercase",
                      rolBadgeClass[u.rol],
                    )}
                  >
                    {rolLabel[u.rol]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
                      u.activo
                        ? "bg-status-success/10 text-status-success"
                        : "bg-status-destructive/10 text-status-destructive",
                    )}
                  >
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {dateFormatter.format(new Date(u.createdAt))}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(u)}
                      data-testid="editar-vendedor-button"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        // T-5.3 wires this to useDesactivarVendedor.
                        // No-op placeholder keeps T-5.1 test green.
                      }}
                      disabled={!u.activo}
                      data-testid="desactivar-vendedor-button"
                    >
                      Desactivar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          className="flex items-center justify-between px-1 typo-label-md text-muted-foreground"
          data-testid="usuarios-pagination"
        >
          <span>
            Pagina {page + 1} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-md border border-border px-3 py-1 text-foreground hover:bg-muted disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-md border border-border px-3 py-1 text-foreground hover:bg-muted disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      <CrearVendedorDialog open={crearOpen} onOpenChange={setCrearOpen} />
      <EditarVendedorDialog
        open={editarOpen}
        onOpenChange={(next) => {
          setEditarOpen(next);
          if (!next) setSelectedVendedor(null);
        }}
        vendedor={selectedVendedor}
      />
    </div>
  );
}
