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
          <label htmlFor="filter-tipo" className="typo-label-md text-muted-foreground mb-1 block">Tipo</label>
          <Select value={filters.tipo || "all"} onValueChange={(val) => update("tipo", val === "all" ? "" : val)}>
            <SelectTrigger id="filter-tipo" className="h-8 w-full" aria-label="Tipo de propiedad">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              {TIPO_OPTIONS.map((o) => (
                <SelectItem key={o.value || "all"} value={o.value || "all"}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Estado */}
        <div>
          <label htmlFor="filter-estado" className="typo-label-md text-muted-foreground mb-1 block">Estado</label>
          <Select value={filters.estado || "all"} onValueChange={(val) => update("estado", val === "all" ? "" : val)}>
            <SelectTrigger id="filter-estado" className="h-8 w-full" aria-label="Estado de propiedad">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              {ESTADO_OPTIONS.map((o) => (
                <SelectItem key={o.value || "all"} value={o.value || "all"}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Distrito */}
        <div>
          <label htmlFor="filter-distrito" className="typo-label-md text-muted-foreground mb-1 block">Distrito</label>
          <Select value={filters.distrito || "all"} onValueChange={(val) => update("distrito", val === "all" ? "" : val)}>
            <SelectTrigger id="filter-distrito" className="h-8 w-full" aria-label="Distrito">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {DISTRITOS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Moneda */}
        <div>
          <label htmlFor="filter-moneda" className="typo-label-md text-muted-foreground mb-1 block">Moneda</label>
          <Select value={filters.moneda || "all"} onValueChange={(val) => update("moneda", val === "all" ? "" : val)}>
            <SelectTrigger id="filter-moneda" className="h-8 w-full" aria-label="Moneda">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              {MONEDA_OPTIONS.map((o) => (
                <SelectItem key={o.value || "all"} value={o.value || "all"}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Precio Min */}
        <div>
          <label htmlFor="filter-precio-min" className="typo-label-md text-muted-foreground mb-1 block">Precio min</label>
          <Input
            id="filter-precio-min"
            type="number"
            placeholder="0"
            value={filters.precioMin}
            onChange={(e) => update("precioMin", e.target.value)}
          />
        </div>

        {/* Precio Max */}
        <div>
          <label htmlFor="filter-precio-max" className="typo-label-md text-muted-foreground mb-1 block">Precio max</label>
          <Input
            id="filter-precio-max"
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
