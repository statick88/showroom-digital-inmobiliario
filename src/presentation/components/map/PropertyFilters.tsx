"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";

const TIPO_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "lote", label: "Lote" },
  { value: "departamento", label: "Departamento" },
  { value: "casa", label: "Casa" },
  { value: "local", label: "Local" },
];

const ESTADO_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "disponible", label: "Disponible" },
  { value: "separado", label: "Separado" },
  { value: "vendido", label: "Vendido" },
];

const DISTRITOS = [
  "San Isidro",
  "Miraflores",
  "Barranco",
  "La Molina",
  "Surco",
  "San Borja",
  "Jesus María",
  "Lince",
  "Magdalena",
  "Pueblo Libre",
];

const MONEDA_OPTIONS = [
  { value: "", label: "Todas" },
  { value: "PEN", label: "S/" },
  { value: "USD", label: "$" },
];

export interface FiltersState {
  tipo: string;
  estado: string;
  distrito: string;
  precioMin: string;
  precioMax: string;
  moneda: string;
}

interface PropertyFiltersProps {
  filters: FiltersState;
  onFilterChange: (filters: FiltersState) => void;
}

export function PropertyFilters({ filters, onFilterChange }: PropertyFiltersProps) {
  const update = useCallback(
    (key: keyof FiltersState, value: string) => {
      onFilterChange({ ...filters, [key]: value });
    },
    [filters, onFilterChange],
  );

  const handleReset = useCallback(() => {
    onFilterChange({
      tipo: "",
      estado: "",
      distrito: "",
      precioMin: "",
      precioMax: "",
      moneda: "",
    });
  }, [onFilterChange]);

  const hasActiveFilters =
    filters.tipo ||
    filters.estado ||
    filters.distrito ||
    filters.precioMin ||
    filters.precioMax ||
    filters.moneda;

  return (
    <div className="space-y-3 px-4 py-3 border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <span className="typo-label-md font-semibold text-foreground">Filtros</span>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs gap-1">
            <X className="size-3" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Tipo */}
        <div>
          <label className="typo-label-md text-muted-foreground mb-1 block">Tipo</label>
          <select
            value={filters.tipo}
            onChange={(e) => update("tipo", e.target.value)}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {TIPO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="typo-label-md text-muted-foreground mb-1 block">Estado</label>
          <select
            value={filters.estado}
            onChange={(e) => update("estado", e.target.value)}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {ESTADO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Distrito */}
        <div>
          <label className="typo-label-md text-muted-foreground mb-1 block">Distrito</label>
          <select
            value={filters.distrito}
            onChange={(e) => update("distrito", e.target.value)}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Todos</option>
            {DISTRITOS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Moneda */}
        <div>
          <label className="typo-label-md text-muted-foreground mb-1 block">Moneda</label>
          <select
            value={filters.moneda}
            onChange={(e) => update("moneda", e.target.value)}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {MONEDA_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Precio Min */}
        <div>
          <label className="typo-label-md text-muted-foreground mb-1 block">Precio min</label>
          <Input
            type="number"
            placeholder="0"
            value={filters.precioMin}
            onChange={(e) => update("precioMin", e.target.value)}
          />
        </div>

        {/* Precio Max */}
        <div>
          <label className="typo-label-md text-muted-foreground mb-1 block">Precio max</label>
          <Input
            type="number"
            placeholder="999999"
            value={filters.precioMax}
            onChange={(e) => update("precioMax", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
