"use client";

import { useMemo } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { usePropiedades } from "@/presentation/hooks/usePropiedades";
import type { FiltrosPropiedades } from "@/domain/repositories/propiedades.repository";

const TIPOS = [
  { value: "lote", label: "Lote" },
  { value: "departamento", label: "Departamento" },
  { value: "casa", label: "Casa" },
  { value: "local", label: "Local" },
  { value: "oficina", label: "Oficina" },
  { value: "terreno", label: "Terreno" },
] as const;

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
  const { data: propiedades } = usePropiedades();

  const distritos = useMemo(() => {
    if (!propiedades) return [];
    const set = new Set<string>();
    propiedades.forEach((p) => {
      if (p.distrito) set.add(p.distrito);
    });
    return Array.from(set).sort();
  }, [propiedades]);

  const hasFilters =
    filters.tipo || filters.estado || filters.distrito || filters.precioMin || filters.precioMax;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Tipo */}
      <Select
        value={filters.tipo ?? ""}
        onValueChange={(value) => onChange({ ...filters, tipo: value || undefined })}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos</SelectItem>
          {TIPOS.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Estado */}
      <Select
        value={filters.estado ?? ""}
        onValueChange={(value) => onChange({ ...filters, estado: value || undefined })}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos</SelectItem>
          {ESTADOS.map((e) => (
            <SelectItem key={e.value} value={e.value}>
              {e.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Distrito */}
      <Select
        value={filters.distrito ?? ""}
        onValueChange={(value) => onChange({ ...filters, distrito: value || undefined })}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Distrito" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos</SelectItem>
          {distritos.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Precio min */}
      <Input
        type="number"
        placeholder="Mín."
        value={filters.precioMin ?? ""}
        onChange={(e) =>
          onChange({
            ...filters,
            precioMin: e.target.value ? Number(e.target.value) : undefined,
          })
        }
        className="w-24 h-8 text-sm"
      />

      {/* Precio max */}
      <Input
        type="number"
        placeholder="Máx."
        value={filters.precioMax ?? ""}
        onChange={(e) =>
          onChange({
            ...filters,
            precioMax: e.target.value ? Number(e.target.value) : undefined,
          })
        }
        className="w-24 h-8 text-sm"
      />

      {/* Reset */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() =>
            onChange({
              tipo: undefined,
              estado: undefined,
              distrito: undefined,
              precioMin: undefined,
              precioMax: undefined,
              search: undefined,
              agenciaId: undefined,
              cuartosMin: undefined,
              publicada: undefined,
            })
          }
        >
          <RotateCcw className="size-4" />
        </Button>
      )}
    </div>
  );
}
