import { supabase } from "@/lib/supabase/client";
import { rethrowIfPresent } from "@/lib/supabase/errors";
import type { ILotesRepository } from "@/domain/repositories/lotes.repository";
import type { Lote, FiltrosLotes, CrearLoteData, EstadoLote } from "@/domain/entities/lote";

function mapLote(row: Record<string, unknown>): Lote {
  return {
    id: row.id as string,
    proyectoId: row.proyecto_id as string,
    codigo: row.codigo as string,
    areaTotal: Number(row.area_total),
    frente: row.frente ? Number(row.frente) : undefined,
    fondo: row.fondo ? Number(row.fondo) : undefined,
    precio: Number(row.precio),
    moneda: row.moneda as "PEN" | "USD",
    estado: row.estado as EstadoLote,
    poligonoCoords: Array.isArray(row.poligono_coords) ? (row.poligono_coords as number[][][]) : [],
    imagenPlano: row.imagen_plano as string | undefined,
    descripcion: row.descripcion as string | undefined,
    orden: (row.orden as number) ?? 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const lotesRepository: ILotesRepository = {
  async listar(proyectoId, filtros) {
    let query = supabase
      .from("lotes")
      .select("*")
      .eq("proyecto_id", proyectoId)
      .order("orden", { ascending: true });

    if (filtros?.estado) {
      query = query.eq("estado", filtros.estado);
    }
    if (filtros?.search) {
      const term = filtros.search.replace(/[%_\\]/g, "").slice(0, 100);
      query = query.or(`codigo.ilike.%${term}%,descripcion.ilike.%${term}%`);
    }

    const { data, error } = await query;
    rethrowIfPresent(error, "Error al listar lotes");
    return (data ?? []).map(mapLote);
  },

  async obtenerPorId(id) {
    const { data, error } = await supabase.from("lotes").select("*").eq("id", id).single();
    if (error) return null;
    return mapLote(data);
  },

  async crear(data) {
    const { data: lote, error } = await supabase
      .from("lotes")
      .insert({
        proyecto_id: data.proyectoId,
        codigo: data.codigo,
        area_total: data.areaTotal,
        frente: data.frente ?? null,
        fondo: data.fondo ?? null,
        precio: data.precio,
        moneda: data.moneda,
        estado: data.estado ?? "disponible",
        poligono_coords: data.poligonoCoords,
        imagen_plano: data.imagenPlano ?? null,
        descripcion: data.descripcion ?? null,
        orden: data.orden ?? 0,
      })
      .select("*")
      .single();
    rethrowIfPresent(error, "Error al crear lote");
    return mapLote(lote);
  },

  async actualizar(id, data) {
    const updates: Record<string, unknown> = {};
    if (data.precio !== undefined) updates.precio = data.precio;
    if (data.areaTotal !== undefined) updates.area_total = data.areaTotal;
    if (data.frente !== undefined) updates.frente = data.frente;
    if (data.fondo !== undefined) updates.fondo = data.fondo;
    if (data.moneda !== undefined) updates.moneda = data.moneda;
    if (data.estado !== undefined) updates.estado = data.estado;
    if (data.poligonoCoords !== undefined) updates.poligono_coords = data.poligonoCoords;
    if (data.imagenPlano !== undefined) updates.imagen_plano = data.imagenPlano;
    if (data.descripcion !== undefined) updates.descripcion = data.descripcion;
    if (data.orden !== undefined) updates.orden = data.orden;
    if (data.codigo !== undefined) updates.codigo = data.codigo;

    const { data: lote, error } = await supabase
      .from("lotes")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();
    rethrowIfPresent(error, "Error al actualizar lote");
    return mapLote(lote);
  },

  async cambiarEstado(id, estado) {
    const { data: lote, error } = await supabase
      .from("lotes")
      .update({ estado })
      .eq("id", id)
      .select("*")
      .single();
    rethrowIfPresent(error, "Error al cambiar estado del lote");
    return mapLote(lote);
  },

  async eliminar(id) {
    const { error } = await supabase.from("lotes").delete().eq("id", id);
    rethrowIfPresent(error, "Error al eliminar lote");
  },
};
