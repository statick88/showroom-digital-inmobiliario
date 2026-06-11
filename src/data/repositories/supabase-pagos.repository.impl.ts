import { supabase } from "@/lib/supabase/client";
import type { Pago, CrearPagoData } from "@/domain/entities/pago";
import type { PagosRepository } from "@/domain/repositories/pagos.repository";

function mapRow(row: Record<string, unknown>): Pago {
  return {
    id: row.id as string,
    transaccionId: row.transaccion_id as string,
    monto: row.monto as number,
    metodoPago: row.metodo_pago as Pago["metodoPago"],
    cci: (row.cci as string) ?? undefined,
    referenciaExterna: (row.referencia_externa as string) ?? undefined,
    fechaPago: row.fecha_pago as string,
    notas: (row.notas as string) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapToRow(data: CrearPagoData): Record<string, unknown> {
  return {
    transaccion_id: data.transaccionId,
    monto: data.monto,
    metodo_pago: data.metodoPago,
    cci: data.cci ?? null,
    referencia_externa: data.referenciaExterna ?? null,
    fecha_pago: data.fechaPago,
    notas: data.notas ?? null,
  };
}

export const supabasePagosRepository: PagosRepository = {
  async findAll(): Promise<Pago[]> {
    const { data, error } = await supabase
      .from("pagos")
      .select("*")
      .order("fecha_pago", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapRow);
  },

  async findByTransaccionId(transaccionId: string): Promise<Pago[]> {
    const { data, error } = await supabase
      .from("pagos")
      .select("*")
      .eq("transaccion_id", transaccionId)
      .order("fecha_pago", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapRow);
  },

  async create(data: CrearPagoData): Promise<Pago> {
    const row = mapToRow(data);
    const { data: created, error } = await supabase
      .from("pagos")
      .insert(row)
      .select()
      .single();

    if (error) throw error;
    return mapRow(created);
  },

  async getTotalPagado(transaccionId: string): Promise<number> {
    const { data, error } = await supabase
      .from("pagos")
      .select("monto")
      .eq("transaccion_id", transaccionId);

    if (error) throw error;
    return (data ?? []).reduce((sum, row) => sum + (row.monto as number), 0);
  },
};