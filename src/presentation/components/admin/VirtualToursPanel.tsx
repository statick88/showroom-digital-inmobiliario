import { useState } from "react";
import { useVirtualTours, useEliminarVirtualTour, useActualizarVirtualTour } from "@/presentation/hooks/use-virtual-tour";
import { VirtualTourForm } from "./VirtualTourForm";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, Plus, Trash2, Edit, Eye, EyeOff, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

type TourEstado = "borrador" | "publicado" | "archivado";

const estadoConfig: Record<TourEstado, { label: string; color: string }> = {
  borrador: { label: "Borrador", color: "text-muted-foreground bg-muted" },
  publicado: { label: "Publicado", color: "text-status-success bg-status-success/10" },
  archivado: { label: "Archivado", color: "text-status-warning bg-status-warning/10" },
};

export function VirtualToursPanel() {
  const { data: tours, isLoading } = useVirtualTours();
  const eliminarTour = useEliminarVirtualTour();
  const actualizarTour = useActualizarVirtualTour();
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTourId, setEditingTourId] = useState<string | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; tourId: string; nombre: string }>({
    open: false,
    tourId: "",
    nombre: "",
  });

  const filtered = (tours ?? []).filter((t) => {
    const matchSearch = !search || t.nombre.toLowerCase().includes(search.toLowerCase());
    const matchEstado = !filterEstado || t.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const handleEdit = (tourId: string) => {
    setEditingTourId(tourId);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditingTourId(undefined);
    setFormOpen(true);
  };

  const handleDelete = () => {
    eliminarTour.mutate(deleteConfirm.tourId, {
      onSuccess: () => setDeleteConfirm({ open: false, tourId: "", nombre: "" }),
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tours Virtuales 360°</h2>
          <p className="text-sm text-muted-foreground">Gestiona los recorridos virtuales del proyecto</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus size={18} />
          Nuevo Tour
        </Button>
      </header>

      {/* Search + Filter */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-muted/50 border-b border-border flex flex-wrap gap-4 items-center">
          <div className="relative flex-grow max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none bg-card text-sm"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterEstado || "all"} onValueChange={(val) => setFilterEstado(val === "all" ? "" : val)}>
            <SelectTrigger className="w-[180px]" aria-label="Filtrar por estado">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="borrador">Borrador</SelectItem>
              <SelectItem value="publicado">Publicado</SelectItem>
              <SelectItem value="archivado">Archivado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted">
              <tr>
                <th className="p-4 text-xs text-muted-foreground font-medium">Nombre</th>
                <th className="p-4 text-xs text-muted-foreground font-medium">Proyecto</th>
                <th className="p-4 text-xs text-muted-foreground font-medium">Escenas</th>
                <th className="p-4 text-xs text-muted-foreground font-medium">Estado</th>
                <th className="p-4 text-xs text-muted-foreground font-medium">Creado</th>
                <th className="p-4 text-xs text-muted-foreground font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8">
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((tour) => {
                  const ec = estadoConfig[tour.estado as TourEstado] ?? estadoConfig.borrador;
                  return (
                    <tr key={tour.id} className="hover:bg-muted transition-colors">
                      <td className="p-4 text-sm font-medium text-foreground">{tour.nombre}</td>
                      <td className="p-4 text-sm text-muted-foreground">{tour.proyectoId?.slice(0, 8) ?? "—"}...</td>
                      <td className="p-4 text-sm text-muted-foreground">{tour.escenas.length}</td>
                      <td className="p-4">
                        <span className={cn("text-xs px-2 py-1 rounded-full font-medium", ec.color)}>
                          {ec.label}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(tour.createdAt).toLocaleDateString("es-PE")}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              actualizarTour.mutate({
                                id: tour.id,
                                data: {
                                  estado:
                                    tour.estado === "publicado" ? "borrador" : "publicado",
                                },
                              })
                            }
                            className="text-muted-foreground hover:text-primary transition-colors"
                            title={
                              tour.estado === "publicado"
                                ? "Despublicar"
                                : "Publicar"
                            }
                          >
                            {tour.estado === "publicado" ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(tour.id)}
                            className="text-muted-foreground hover:text-primary transition-colors"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ open: true, tourId: tour.id, nombre: tour.nombre })}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title={search || filterEstado ? "No se encontraron tours con esos filtros" : "No hay tours virtuales"}
                      description={search || filterEstado ? "Intenta ajustar los filtros." : "Crea un tour virtual para comenzar."}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Form */}
      <VirtualTourForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingTourId(undefined);
        }}
        tourId={editingTourId}
      />

      {/* Delete Confirmation */}
      <Dialog
        open={deleteConfirm.open}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm({ open: false, tourId: "", nombre: "" });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Tour</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de eliminar &quot;{deleteConfirm.nombre}&quot;? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm({ open: false, tourId: "", nombre: "" })}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={eliminarTour.isPending}
            >
              {eliminarTour.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
