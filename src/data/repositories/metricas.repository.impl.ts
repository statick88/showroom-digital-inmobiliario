import { supabase } from "@/lib/supabase/client";
import { rethrowIfPresent } from "@/lib/supabase/errors";
import type {
  MetricasRepository,
  CrearMetricaData,
} from "@/domain/repositories/propiedades.repository";
import type { Propiedad } from "@/domain/entities/propiedad";

function mapPropiedad(row: Record<string, unknown>): Propiedad {
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

export const metricasRepository: MetricasRepository = {
  async registrarClick(data: CrearMetricaData) {
    // Fire-and-forget analytics: never block the user flow.
    try {
      await supabase.from("metricas_clicks").insert({
        propiedad_id: data.propiedadId,
        tipo_evento: data.tipoEvento,
        sesion_id: data.sesionId,
        perfil_id: data.perfilId,
        pagina_origen: data.paginaOrigen,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const reason = message || "unknown";
      if (typeof console !== "undefined") {
        console.warn("[metricas] click tracking skipped:", reason);
      }
      // Swallow network/abort/resource errors — analytics must not
      // break the product experience.
    }
  },

  async obtenerTopClicks(agenciaId: string, limite = 10) {
    const { data, error } = await supabase.rpc("obtener_top_clicks", {
      p_agencia_id: agenciaId,
      p_limite: limite,
    });

    rethrowIfPresent(error, "Error al obtener top clics");

    return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
      propiedad: mapPropiedad(row as Record<string, unknown>),
      clicks: Number(row.total_clicks),
    }));
  },
};
