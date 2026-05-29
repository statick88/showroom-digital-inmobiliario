import { supabase } from "@/lib/supabase/client";
import { rethrowIfPresent } from "@/lib/supabase/errors";
import type {
  PropiedadesRepository,
  FiltrosPropiedades,
  CrearPropiedadData,
} from "@/domain/repositories/propiedades.repository";
import type { Propiedad, DashboardMetricas } from "@/domain/entities/propiedad";

const LISTAR_LIMIT = 200;

function sanitizeSearch(term: string): string {
  return term.replace(/[%_]/g, "");
}

function mapPropiedad(row: Record<string, unknown>): Propiedad {
  const ubicacion = row.ubicacion as { x: number; y: number } | null;
  return {
    id: row.id as string,
    codigo: row.codigo as string,
    tipo: row.tipo as Propiedad["tipo"],
    estado: row.estado as Propiedad["estado"],
    precio: Number(row.precio),
    moneda: (row.moneda as string) ?? "PEN",
    titulo: row.titulo as string,
    descripcion: row.descripcion as string | undefined,
    areaM2: row.area_m2 ? Number(row.area_m2) : undefined,
    cuartos: row.cuartos as number | undefined,
    banios: row.banios as number | undefined,
    ubicacion: ubicacion ?? undefined,
    direccion: row.direccion as string | undefined,
    distrito: row.distrito as string | undefined,
    ciudad: (row.ciudad as string) ?? "Lima",
    imagenes: (row.imagenes as string[]) ?? [],
    svgId: row.svg_id as string | undefined,
    agenciaId: row.agencia_id as string | undefined,
    publicada: row.publicada as boolean,
    destacada: row.destacada as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const propiedadesRepository: PropiedadesRepository = {
  async listar(filtros?: FiltrosPropiedades) {
    let query = supabase
      .from("propiedades")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(LISTAR_LIMIT);

    if (filtros?.tipo) query = query.eq("tipo", filtros.tipo);
    if (filtros?.estado) query = query.eq("estado", filtros.estado);
    if (filtros?.distrito) query = query.eq("distrito", filtros.distrito);
    if (filtros?.agenciaId) query = query.eq("agencia_id", filtros.agenciaId);
    if (filtros?.precioMin) query = query.gte("precio", filtros.precioMin);
    if (filtros?.precioMax) query = query.lte("precio", filtros.precioMax);
    if (filtros?.search) {
      const sanitized = sanitizeSearch(filtros.search);
      query = query.or(
        `titulo.ilike.%${sanitized}%,codigo.ilike.%${sanitized}%,descripcion.ilike.%${sanitized}%`,
      );
    }

    const { data, error } = await query;
    rethrowIfPresent(error, "Error al cargar propiedades");
    return (data ?? []).map(mapPropiedad);
  },

  async obtenerPorId(id: string) {
    const { data, error } = await supabase.from("propiedades").select("*").eq("id", id).single();
    if (error) return null;
    return mapPropiedad(data);
  },

  async crear(data: CrearPropiedadData) {
    const { data: row, error } = await supabase
      .from("propiedades")
      .insert({
        codigo: data.codigo,
        tipo: data.tipo,
        precio: data.precio,
        titulo: data.titulo,
        descripcion: data.descripcion,
        area_m2: data.areaM2,
        cuartos: data.cuartos,
        banios: data.banios,
        distrito: data.distrito,
        ciudad: data.ciudad ?? "Lima",
        imagenes: data.imagenes ?? [],
        svg_id: data.svgId,
        agencia_id: data.agenciaId,
      })
      .select("*")
      .single();
    rethrowIfPresent(error, "Error al crear propiedad");
    return mapPropiedad(row);
  },

  async actualizar(id: string, data: Partial<Propiedad>) {
    const dbData: Record<string, unknown> = {};
    if (data.titulo !== undefined) dbData.titulo = data.titulo;
    if (data.descripcion !== undefined) dbData.descripcion = data.descripcion;
    if (data.precio !== undefined) dbData.precio = data.precio;
    if (data.estado !== undefined) dbData.estado = data.estado;
    if (data.distrito !== undefined) dbData.distrito = data.distrito;
    if (data.imagenes !== undefined) dbData.imagenes = data.imagenes;
    if (data.publicada !== undefined) dbData.publicada = data.publicada;
    if (data.destacada !== undefined) dbData.destacada = data.destacada;

    const { data: row, error } = await supabase
      .from("propiedades")
      .update(dbData)
      .eq("id", id)
      .select("*")
      .single();
    rethrowIfPresent(error, "Error al actualizar propiedad");
    return mapPropiedad(row);
  },

  async eliminar(id: string) {
    const { error } = await supabase.from("propiedades").delete().eq("id", id);
    rethrowIfPresent(error, "Error al eliminar propiedad");
  },

  async cambiarEstado(id: string, estado: Propiedad["estado"]) {
    const { data: row, error } = await supabase
      .from("propiedades")
      .update({ estado })
      .eq("id", id)
      .select("*")
      .single();
    rethrowIfPresent(error, "Error al cambiar estado");
    return mapPropiedad(row);
  },

  async obtenerDashboard(agenciaId: string) {
    const { data, error } = await supabase
      .rpc("obtener_metricas_dashboard", { p_agencia_id: agenciaId })
      .single();
    rethrowIfPresent(error, "Error al obtener métricas");
    return data as DashboardMetricas;
  },
};
