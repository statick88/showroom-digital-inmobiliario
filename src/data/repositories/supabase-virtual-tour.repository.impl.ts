import { supabase } from "@/lib/supabase/client";
import { rethrowIfPresent } from "@/lib/supabase/errors";
import type { IVirtualTourRepository } from "@/domain/repositories/virtual-tour.repository";
import type {
  VirtualTour,
  VirtualTourScene,
} from "@/domain/entities/virtual-tour";

function mapVirtualTour(row: Record<string, unknown>): VirtualTour {
  const escenas = (row.escenas as VirtualTourScene[]) ?? [];
  return {
    id: row.id as string,
    proyectoId: row.proyecto_id as string,
    propiedadId: row.propiedad_id as string | undefined,
    nombre: row.nombre as string,
    descripcion: row.descripcion as string | undefined,
    escenas,
    escenaInicialId: row.escena_inicial_id as string,
    metadatos: (row.metadatos as VirtualTour["metadatos"]) ?? {},
    estado: row.estado as VirtualTour["estado"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const virtualTourRepository: IVirtualTourRepository = {
  async findAll() {
    const { data, error } = await supabase
      .from("tours_360")
      .select("*")
      .order("created_at", { ascending: false });

    rethrowIfPresent(error, "Error al listar tours virtuales");
    return (data ?? []).map(mapVirtualTour);
  },

  async findByProyectoId(proyectoId) {
    const { data, error } = await supabase
      .from("tours_360")
      .select("*")
      .eq("proyecto_id", proyectoId)
      .order("created_at", { ascending: false });

    rethrowIfPresent(error, "Error al listar tours virtuales");
    return (data ?? []).map(mapVirtualTour);
  },

  async findById(id) {
    const { data, error } = await supabase
      .from("tours_360")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return mapVirtualTour(data);
  },

  async create(data) {
    const { data: tour, error } = await supabase
      .from("tours_360")
      .insert({
        proyecto_id: data.proyectoId,
        propiedad_id: data.propiedadId ?? null,
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
        escenas: data.escenas,
        escena_inicial_id: data.escenaInicialId,
        metadatos: data.metadatos ?? {},
        estado: data.estado ?? "borrador",
      })
      .select("*")
      .single();

    rethrowIfPresent(error, "Error al crear tour virtual");
    return mapVirtualTour(tour);
  },

  async update(id, data) {
    const updates: Record<string, unknown> = {};

    if (data.nombre !== undefined) updates.nombre = data.nombre;
    if (data.descripcion !== undefined) updates.descripcion = data.descripcion;
    if (data.escenas !== undefined) updates.escenas = data.escenas;
    if (data.escenaInicialId !== undefined) updates.escena_inicial_id = data.escenaInicialId;
    if (data.metadatos !== undefined) updates.metadatos = data.metadatos;
    if (data.estado !== undefined) updates.estado = data.estado;

    const { data: tour, error } = await supabase
      .from("tours_360")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    rethrowIfPresent(error, "Error al actualizar tour virtual");
    return mapVirtualTour(tour);
  },

  async delete(id) {
    const { error } = await supabase.from("tours_360").delete().eq("id", id);
    rethrowIfPresent(error, "Error al eliminar tour virtual");
  },
};
