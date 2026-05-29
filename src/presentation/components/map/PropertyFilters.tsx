"use client";

import { useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FiltrosPropiedades } from "@/domain/repositories/propiedades.repository";

const ESTADOS = [
  { value: "disponible", label: "Disponible" },
  { value: "separado", label: "Separado" },
  { value: "vendido", label: "Vendido" },
] as const;

export function PropertyFilters({
  filters,
  onChange,
}: {
  filters: FiltrosPropiedades;
  onChange: (filters: FiltrosPropiedades) => void;
}) {
  const hasFilters = filters.tipo || filters.estado || filters.distrito;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Tipo */}
      <div className="flex flex-col gap-1">
        <label className="font-label-md text-label-md text-on-surface-variant">Tipo</label>
        <select
          value={filters.tipo ?? ""}
          onChange={(e) => onChange({ ...filters, tipo: e.target.value || undefined })}
          className="bg-surface-container-low border border-outline-variant rounded-lg p-2 text-label-md focus:ring-primary focus:border-primary outline-none"
        >
          <option value="">Todos</option>
          <option value="departamento">Departamento</option>
          <option value="casa">Casa</option>
          <option value="oficina">Oficina</option>
        </select>
      </div>

      {/* Distrito */}
      <div className="flex flex-col gap-1">
        <label className="font-label-md text-label-md text-on-surface-variant">Distrito</label>
        <select
          value={filters.distrito ?? ""}
          onChange={(e) => onChange({ ...filters, distrito: e.target.value || undefined })}
          className="bg-surface-container-low border border-outline-variant rounded-lg p-2 text-label-md focus:ring-primary focus:border-primary outline-none"
        >
          <option value="">Todos</option>
          <option value="San Isidro">San Isidro</option>
          <option value="Miraflores">Miraflores</option>
          <option value="Surco">Surco</option>
          <option value="Barranco">Barranco</option>
        </select>
      </div>

      {/* Precio Máx */}
      <div className="flex flex-col gap-1">
        <label className="font-label-md text-label-md text-on-surface-variant">Precio Max</label>
        <input
          type="number"
          placeholder="S/ 0.00"
          value={filters.precioMax ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              precioMax: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="bg-surface-container-low border border-outline-variant rounded-lg p-2 text-label-md focus:ring-primary focus:border-primary outline-none"
        />
      </div>

      {/* Estado */}
      <div className="flex flex-col gap-1">
        <label className="font-label-md text-label-md text-on-surface-variant">Estado</label>
        <select
          value={filters.estado ?? ""}
          onChange={(e) => onChange({ ...filters, estado: e.target.value || undefined })}
          className="bg-surface-container-low border border-outline-variant rounded-lg p-2 text-label-md focus:ring-primary focus:border-primary outline-none"
        >
          <option value="">Todos</option>
          {ESTADOS.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear button */}
      {hasFilters && (
        <button
          onClick={() => onChange({})}
          className="col-span-2 flex items-center justify-center gap-2 px-4 py-2 text-primary hover:underline"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}