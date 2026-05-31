import { supabase } from "@/lib/supabase/client";
import { rethrowIfPresent } from "@/lib/supabase/errors";
import type { IProyectosRepository } from "@/domain/repositories/proyectos.repository";
import type { Proyecto, CrearProyectoData } from "@/domain/entities/lote";

function mapProyecto(row: Record<string, unknown>): Proyecto {
  return {
    id: row.id as string,
    nombre: row.nombre as string,
    descripcion: row.descripcion as string | undefined,
    ubicacion: row.ubicacion as string | undefined,
    coordenadasCentro: row.coordenadas_centro as { lat: number; lng: number },
    imagenHero: row.imagen_hero as string | undefined,
    imagenes360: (row.imagenes_360 as string[]) ?? [],
    activo: row.activo as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const proyectosRepository: IProyectosRepository = {
  async listar() {
    const { data, error } = await supabase
      .from("proyectos")
      .select("*")
      .order("created_at", { ascending: false });
    rethrowIfPresent(error, "Error al listar proyectos");
    return (data ?? []).map(mapProyecto);
  },

  async obtenerPorId(id) {
    const { data, error } = await supabase.from("proyectos").select("*").eq("id", id).single();
    if (error) return null;
    return mapProyecto(data);
  },

  async crear(data) {
    const { data: proyecto, error } = await supabase
      .from("proyectos")
      .insert({
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
        ubicacion: data.ubicacion ?? null,
        coordenadas_centro: data.coordenadasCentro,
        imagen_hero: data.imagenHero ?? null,
        imagenes_360: data.imagenes360 ?? [],
      })
      .select("*")
      .single();
    rethrowIfPresent(error, "Error al crear proyecto");
    return mapProyecto(proyecto);
  },

  async actualizar(id, data) {
    const updates: Record<string, unknown> = {};
    if (data.nombre !== undefined) updates.nombre = data.nombre;
    if (data.descripcion !== undefined) updates.descripcion = data.descripcion;
    if (data.ubicacion !== undefined) updates.ubicacion = data.ubicacion;
    if (data.coordenadasCentro !== undefined) updates.coordenadas_centro = data.coordenadasCentro;
    if (data.imagenHero !== undefined) updates.imagen_hero = data.imagenHero;
    if (data.imagenes360 !== undefined) updates.imagenes_360 = data.imagenes360;
    if (data.activo !== undefined) updates.activo = data.activo;

    const { data: proyecto, error } = await supabase
      .from("proyectos")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();
    rethrowIfPresent(error, "Error al actualizar proyecto");
    return mapProyecto(proyecto);
  },

  async eliminar(id) {
    const { error } = await supabase.from("proyectos").delete().eq("id", id);
    rethrowIfPresent(error, "Error al eliminar proyecto");
  },
};
