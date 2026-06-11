"use client";

import { useState, useEffect } from "react";
import { useVirtualTour, useCrearVirtualTour, useActualizarVirtualTour } from "@/presentation/hooks/use-virtual-tour";
import { useProyectos } from "@/presentation/hooks/useProyectos";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { ImageUploader } from "@/presentation/components/shared/ImageUploader";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface SceneInput {
  id: string;
  textureUrl: string;
  thumbnailUrl: string;
  yaw: number;
  pitch: number;
  fov: number;
  hotspots: HotspotInput[];
}

interface HotspotInput {
  id: string;
  targetSceneId: string;
  label: string;
  yaw: number;
  pitch: number;
}

interface VirtualTourFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tourId?: string;
}

function newSceneId(): string {
  return crypto.randomUUID();
}

function newHotspotId(): string {
  return crypto.randomUUID();
}

const emptyScene = (): SceneInput => ({
  id: newSceneId(),
  textureUrl: "",
  thumbnailUrl: "",
  yaw: 0,
  pitch: 0,
  fov: 110,
  hotspots: [],
});

export function VirtualTourForm({ open, onOpenChange, tourId }: VirtualTourFormProps) {
  const isEditing = !!tourId;
  const { data: existingTour } = useVirtualTour(tourId);
  const { data: proyectos } = useProyectos();
  const crearTour = useCrearVirtualTour();
  const actualizarTour = useActualizarVirtualTour();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [proyectoId, setProyectoId] = useState("");
  const [estado, setEstado] = useState<"borrador" | "publicado" | "archivado">("borrador");
  const [scenes, setScenes] = useState<SceneInput[]>([emptyScene()]);
  const [expandedScene, setExpandedScene] = useState<number | null>(0);

  // Populate form when editing
  useEffect(() => {
    if (existingTour && open) {
      setNombre(existingTour.nombre);
      setDescripcion(existingTour.descripcion ?? "");
      setProyectoId(existingTour.proyectoId);
      setEstado(existingTour.estado);
      const mapped: SceneInput[] = existingTour.escenas.map((s) => ({
        id: s.id,
        textureUrl: s.textureUrl,
        thumbnailUrl: s.thumbnailUrl,
        yaw: s.yaw,
        pitch: s.pitch,
        fov: s.fov,
        hotspots: (s.hotspots ?? []).map((h) => ({
          id: h.id,
          targetSceneId: h.targetSceneId,
          label: h.label ?? "",
          yaw: h.yaw,
          pitch: h.pitch,
        })),
      }));
      setScenes(mapped.length > 0 ? mapped : [emptyScene()]);
      setExpandedScene(0);
    } else if (open) {
      // Reset for create
      setNombre("");
      setDescripcion("");
      setProyectoId(proyectos?.[0]?.id ?? "");
      setEstado("borrador");
      setScenes([emptyScene()]);
      setExpandedScene(0);
    }
  }, [existingTour, open, proyectos]);

  const updateScene = (index: number, patch: Partial<SceneInput>) => {
    setScenes((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const removeScene = (index: number) => {
    setScenes((prev) => prev.filter((_, i) => i !== index));
    if (expandedScene !== null && expandedScene >= scenes.length - 1) {
      setExpandedScene(Math.max(0, scenes.length - 2));
    }
  };

  const addHotspot = (sceneIndex: number) => {
    const newHs: HotspotInput = {
      id: newHotspotId(),
      targetSceneId: "",
      label: "",
      yaw: 0,
      pitch: 0,
    };
    setScenes((prev) =>
      prev.map((s, i) => (i === sceneIndex ? { ...s, hotspots: [...s.hotspots, newHs] } : s)),
    );
  };

  const updateHotspot = (sceneIndex: number, hsIndex: number, patch: Partial<HotspotInput>) => {
    setScenes((prev) =>
      prev.map((s, i) =>
        i === sceneIndex
          ? { ...s, hotspots: s.hotspots.map((h, j) => (j === hsIndex ? { ...h, ...patch } : h)) }
          : s,
      ),
    );
  };

  const removeHotspot = (sceneIndex: number, hsIndex: number) => {
    setScenes((prev) =>
      prev.map((s, i) =>
        i === sceneIndex ? { ...s, hotspots: s.hotspots.filter((_, j) => j !== hsIndex) } : s,
      ),
    );
  };

  const handleSubmit = () => {
    const escenas = scenes.map((s) => ({
      id: s.id,
      textureUrl: s.textureUrl,
      thumbnailUrl: s.thumbnailUrl,
      yaw: s.yaw,
      pitch: s.pitch,
      fov: s.fov,
      hotspots: s.hotspots.map((h) => ({
        id: h.id,
        targetSceneId: h.targetSceneId,
        label: h.label,
        yaw: h.yaw,
        pitch: h.pitch,
      })),
    }));

    const data = {
      proyectoId,
      nombre,
      descripcion: descripcion || undefined,
      escenas,
      escenaInicialId: scenes[0]!.id,
      metadatos: {},
      estado,
    };

    if (isEditing && tourId) {
      actualizarTour.mutate(
        { id: tourId, data },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      crearTour.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = crearTour.isPending || actualizarTour.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Tour" : "Nuevo Tour Virtual"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifica los datos del tour virtual" : "Crea un nuevo recorrido virtual 360°"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium">Nombre *</label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-input focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none bg-card text-sm"
                placeholder="Tour Virtual - Mi Proyecto"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium">Proyecto *</label>
              <Select value={proyectoId} onValueChange={setProyectoId}>
                <SelectTrigger className="w-full" aria-label="Seleccionar proyecto">
                  <SelectValue placeholder="Seleccionar proyecto..." />
                </SelectTrigger>
                <SelectContent>
                  {proyectos?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">Descripción</label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-input focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none bg-card text-sm resize-none"
              rows={2}
              placeholder="Descripción del tour virtual..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">Estado</label>
            <Select value={estado} onValueChange={(val) => setEstado(val as typeof estado)}>
              <SelectTrigger className="w-full" aria-label="Estado del tour">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="borrador">Borrador</SelectItem>
                <SelectItem value="publicado">Publicado</SelectItem>
                <SelectItem value="archivado">Archivado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scenes */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Escenas ({scenes.length})</h3>
              <Button size="sm" variant="outline" onClick={() => { setScenes((prev) => [...prev, emptyScene()]); setExpandedScene(scenes.length); }}>
                <Plus size={14} className="mr-1" /> Agregar Escena
              </Button>
            </div>

            <div className="space-y-3">
              {scenes.map((scene, si) => (
                <div key={scene.id} className="border border-border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 p-3 bg-muted/50 hover:bg-muted transition-colors text-left"
                    onClick={() => setExpandedScene(expandedScene === si ? null : si)}
                  >
                    <GripVertical size={14} className="text-muted-foreground" />
                    <span className="text-sm font-medium flex-grow">
                      Escena {si + 1}
                    </span>
                    {scenes.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeScene(si); }}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </button>

                  {expandedScene === si && (
                    <div className="p-4 space-y-3 border-t border-border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-muted-foreground">Yaw</label>
                          <input
                            type="number"
                            className="px-3 py-1.5 rounded-lg border border-input text-sm bg-card"
                            value={scene.yaw}
                            onChange={(e) => updateScene(si, { yaw: Number(e.target.value) })}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-muted-foreground">Pitch</label>
                          <input
                            type="number"
                            className="px-3 py-1.5 rounded-lg border border-input text-sm bg-card"
                            value={scene.pitch}
                            onChange={(e) => updateScene(si, { pitch: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">FOV</label>
                        <input
                          type="number"
                          className="px-3 py-1.5 rounded-lg border border-input text-sm bg-card"
                          value={scene.fov}
                          onChange={(e) => updateScene(si, { fov: Number(e.target.value) })}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">Imagen 360° *</label>
                        <ImageUploader
                          value={scene.textureUrl}
                          onChange={(url) => updateScene(si, { textureUrl: url })}
                          folder={`tours/${scene.id}`}
                          label="subir imagen 360°"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">Thumbnail *</label>
                        <ImageUploader
                          value={scene.thumbnailUrl}
                          onChange={(url) => updateScene(si, { thumbnailUrl: url })}
                          folder={`tours/${scene.id}`}
                          label="subir thumbnail"
                        />
                      </div>

                      {/* Hotspots */}
                      <div className="border-t border-border pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground font-medium">
                            Hotspots ({scene.hotspots.length})
                          </span>
                          <button
                            type="button"
                            onClick={() => addHotspot(si)}
                            className="text-xs text-primary hover:underline"
                          >
                            + Agregar
                          </button>
                        </div>
                        {scene.hotspots.map((hs, hi) => (
                          <div key={hs.id} className="flex flex-wrap gap-2 items-end mb-2 p-2 bg-muted/30 rounded-lg">
                            <div className="flex flex-col gap-1 flex-grow min-w-[120px]">
                              <label className="text-[10px] text-muted-foreground">Etiqueta</label>
                              <input
                                className="px-2 py-1 rounded border border-input text-xs bg-card"
                                placeholder="Ir a..."
                                value={hs.label}
                                onChange={(e) => updateHotspot(si, hi, { label: e.target.value })}
                              />
                            </div>
                            <div className="flex flex-col gap-1 min-w-[140px]">
                              <label className="text-[10px] text-muted-foreground">Escena destino</label>
                              <select
                                className="px-2 py-1 rounded border border-input text-xs bg-card"
                                value={hs.targetSceneId}
                                onChange={(e) => updateHotspot(si, hi, { targetSceneId: e.target.value })}
                              >
                                <option value="">Seleccionar...</option>
                                {scenes
                                  .filter((_, idx) => idx !== si)
                                  .map((s, idx) => (
                                    <option key={s.id} value={s.id}>
                                      Escena {scenes.indexOf(s) + 1}
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <div className="flex flex-col gap-1 w-20">
                              <label className="text-[10px] text-muted-foreground">Yaw</label>
                              <input
                                type="number"
                                className="px-2 py-1 rounded border border-input text-xs bg-card"
                                value={hs.yaw}
                                onChange={(e) => updateHotspot(si, hi, { yaw: Number(e.target.value) })}
                              />
                            </div>
                            <div className="flex flex-col gap-1 w-20">
                              <label className="text-[10px] text-muted-foreground">Pitch</label>
                              <input
                                type="number"
                                className="px-2 py-1 rounded border border-input text-xs bg-card"
                                value={hs.pitch}
                                onChange={(e) => updateHotspot(si, hi, { pitch: Number(e.target.value) })}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeHotspot(si, hi)}
                              className="text-muted-foreground hover:text-destructive p-1"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!nombre || !proyectoId || isPending}>
            {isPending ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Tour"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
