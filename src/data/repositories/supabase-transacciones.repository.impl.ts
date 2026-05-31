import { supabase } from "@/lib/supabase/client";
import { rethrowIfPresent } from "@/lib/supabase/errors";
import type { ITransaccionesRepository } from "@/domain/repositories/transacciones.repository";
import type {
  Transaccion,
  CrearTransaccionData,
  DashboardMetricas,
} from "@/domain/entities/lote";

function mapTransaccion(row: Record<string, unknown>): Transaccion {
  return {
    id: row.id as string,
    loteId: row.lote_id as string,
    tipo: row.tipo as Transaccion["tipo"],
    compradorNombre: row.comprador_nombre as string,
    compradorDocumento: row.comprador_documento as string | undefined,
    compradorEmail: row.comprador_email as string | undefined,
    compradorTelefono: row.comprador_telefono as string | undefined,
    monto: Number(row.monto),
    moneda: row.moneda as "PEN" | "USD",
    idVendedor: row.id_vendedor as string | undefined,
    notas: row.notas as string | undefined,
    createdAt: row.created_at as string,
  };
}

export const transaccionesRepository: ITransaccionesRepository = {
  async listar(loteId) {
    let query = supabase
      .from("transacciones")
      .select("*")
      .order("created_at", { ascending: false });

    if (loteId) {
      query = query.eq("lote_id", loteId);
    }

    const { data, error } = await query;
    rethrowIfPresent(error, "Error al listar transacciones");
    return (data ?? []).map(mapTransaccion);
  },

  async crear(data) {
    const { data: transaccion, error } = await supabase
      .from("transacciones")
      .insert({
        lote_id: data.loteId,
        tipo: data.tipo,
        comprador_nombre: data.compradorNombre,
        comprador_documento: data.compradorDocumento ?? null,
        comprador_email: data.compradorEmail ?? null,
        comprador_telefono: data.compradorTelefono ?? null,
        monto: data.monto,
        moneda: data.moneda,
        id_vendedor: data.idVendedor ?? null,
        notas: data.notas ?? null,
      })
      .select("*")
      .single();
    rethrowIfPresent(error, "Error al crear transaccion");
    return mapTransaccion(transaccion);
  },

  async obtenerMetricas(proyectoId) {
    const { data, error } = await supabase
      .rpc("obtener_metricas_lotes", { p_proyecto_id: proyectoId })
      .single();
    rethrowIfPresent(error, "Error al obtener metricas");
    return data as DashboardMetricas;
  },

  async exportarCSV(proyectoId) {
    const { data, error } = await supabase
      .rpc("exportar_transacciones_csv", { p_proyecto_id: proyectoId })
      .single();
    rethrowIfPresent(error, "Error al exportar CSV");
    return data as string;
  },
};
