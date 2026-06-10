"use client";

import { useState } from "react";
import { usePOIs } from "@/presentation/hooks/usePOIs";
import type {
  TourPOI,
  CreatePOIData,
  UpdatePOIData,
  POIType,
} from "@/domain/entities/tour-poi";
import { POI_ICONS } from "@/config/poi-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const POI_TYPE_OPTIONS: { value: POIType; label: string }[] = [
  { value: "amenity", label: "Amenidad" },
  { value: "road", label: "Vía" },
  { value: "attraction", label: "Atracción" },
  { value: "landmark", label: "Punto de referencia" },
  { value: "other", label: "Otro" },
];

interface POIFormData {
  name: string;
  description: string;
  poi_type: POIType;
  icon: string;
  lat: string;
  lng: string;
}

const EMPTY_FORM: POIFormData = {
  name: "",
  description: "",
  poi_type: "amenity",
  icon: "",
  lat: "",
  lng: "",
};

export function TourManagementTab() {
  const [tourId, setTourId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPOI, setEditingPOI] = useState<TourPOI | null>(null);
  const [form, setForm] = useState<POIFormData>(EMPTY_FORM);

  const { pois, isLoading, createPOI, updatePOI, deletePOI } = usePOIs(tourId);

  const openCreate = () => {
    setEditingPOI(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (poi: TourPOI) => {
    setEditingPOI(poi);
    setForm({
      name: poi.name,
      description: poi.description ?? "",
      poi_type: poi.poi_type,
      icon: poi.icon ?? "",
      lat: String(poi.lat),
      lng: String(poi.lng),
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    if (editingPOI) {
      const data: UpdatePOIData = {
        name: form.name,
        description: form.description || undefined,
        poi_type: form.poi_type,
        icon: form.icon || undefined,
        lat,
        lng,
      };
      await updatePOI.mutateAsync({ id: editingPOI.id, data });
    } else {
      const data: CreatePOIData = {
        tour_id: tourId,
        name: form.name,
        description: form.description || undefined,
        poi_type: form.poi_type,
        icon: form.icon || undefined,
        lat,
        lng,
      };
      await createPOI.mutateAsync(data);
    }
    setShowForm(false);
  };

  const handleDelete = async (poi: TourPOI) => {
    if (window.confirm(`¿Eliminar POI "${poi.name}"?`)) {
      await deletePOI.mutateAsync(poi.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestión del Tour</h2>
          <p className="text-sm text-muted-foreground">
            Administrar POIs y asignaciones de lotes
          </p>
        </div>
      </div>

      {/* Tour ID selector */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground font-medium">Tour ID</label>
          <input
            className="px-3 py-2 rounded-lg border border-input bg-card text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="UUID del tour"
            value={tourId}
            onChange={(e) => setTourId(e.target.value)}
          />
        </div>
        {tourId && (
          <button
            onClick={openCreate}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all"
          >
            + Nuevo POI
          </button>
        )}
      </div>

      {/* POI List */}
      {tourId && (
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Cargando POIs...</div>
          ) : pois.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Icono</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Lat</TableHead>
                  <TableHead>Lng</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pois.map((poi) => (
                  <TableRow key={poi.id}>
                    <TableCell className="text-lg">
                      {poi.icon ?? POI_ICONS[poi.poi_type] ?? "📍"}
                    </TableCell>
                    <TableCell className="font-medium">{poi.name}</TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-1 rounded-full bg-muted capitalize">
                        {poi.poi_type}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">
                      {poi.description ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{poi.lat.toFixed(4)}</TableCell>
                    <TableCell className="text-muted-foreground">{poi.lng.toFixed(4)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <button
                        onClick={() => openEdit(poi)}
                        className="text-muted-foreground hover:text-primary transition-colors text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(poi)}
                        className="text-muted-foreground hover:text-destructive transition-colors text-sm"
                      >
                        Eliminar
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No hay POIs para este tour
            </div>
          )}
        </div>
      )}

      {!tourId && (
        <div className="text-center py-12 text-muted-foreground">
          Ingresá un ID de tour para gestionar sus POIs
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPOI ? "Editar POI" : "Nuevo POI"}</DialogTitle>
            <DialogDescription>
              {editingPOI
                ? "Modificá los datos del punto de interés"
                : "Completá los datos para crear un nuevo punto de interés"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <FormField
              label="Nombre"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="Club House"
            />
            <FormField
              label="Descripción (opcional)"
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
              placeholder="Área común del proyecto"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium">Tipo</label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
                value={form.poi_type}
                onChange={(e) =>
                  setForm({ ...form, poi_type: e.target.value as POIType })
                }
              >
                {POI_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <FormField
              label="Icono (emoji, opcional)"
              value={form.icon}
              onChange={(v) => setForm({ ...form, icon: v })}
              placeholder="🏢"
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Latitud"
                value={form.lat}
                onChange={(v) => setForm({ ...form, lat: v })}
                placeholder="-12.05"
              />
              <FormField
                label="Longitud"
                value={form.lng}
                onChange={(v) => setForm({ ...form, lng: v })}
                placeholder="-77.03"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createPOI.isPending || updatePOI.isPending || !form.name}
            >
              {createPOI.isPending || updatePOI.isPending
                ? "Guardando..."
                : editingPOI
                  ? "Guardar Cambios"
                  : "Crear POI"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      <input
        className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
