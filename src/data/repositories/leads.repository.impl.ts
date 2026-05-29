import { supabase } from "@/lib/supabase/client";
import { rethrowIfPresent } from "@/lib/supabase/errors";
import type { LeadsRepository, CrearLeadData } from "@/domain/repositories/propiedades.repository";
import type { Lead } from "@/domain/entities/propiedad";

function mapLead(row: Record<string, unknown>): Lead {
  const propiedades = row.propiedades as Record<string, unknown> | undefined;
  return {
    id: row.id as string,
    propiedadId: row.propiedad_id as string,
    perfilId: row.perfil_id as string | undefined,
    nombre: row.nombre as string,
    email: row.email as string,
    telefono: row.telefono as string | undefined,
    score: row.score as number,
    estado: row.estado as Lead["estado"],
    notas: row.notas as string | undefined,
    propiedadTitulo: (propiedades?.titulo as string) ?? undefined,
    propiedadCodigo: (propiedades?.codigo as string) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export const leadsRepository: LeadsRepository = {
  async listarPorAgencia(agenciaId: string) {
    const { data, error } = await supabase
      .from("leads")
      .select("*, propiedades!inner(codigo, titulo, agencia_id)")
      .eq("propiedades.agencia_id", agenciaId)
      .order("created_at", { ascending: false });

    rethrowIfPresent(error, "Error al cargar leads");
    return (data ?? []).map(mapLead);
  },

  async crear(data: CrearLeadData) {
    const { data: row, error } = await supabase
      .from("leads")
      .insert({
        propiedad_id: data.propiedadId,
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        perfil_id: data.perfilId,
      })
      .select("*")
      .single();
    rethrowIfPresent(error, "Error al enviar solicitud");
    return mapLead(row);
  },

  async actualizarScore(id: string, score: number) {
    const { data: row, error } = await supabase
      .from("leads")
      .update({ score })
      .eq("id", id)
      .select("*")
      .single();
    rethrowIfPresent(error, "Error al actualizar lead");
    return mapLead(row);
  },
};
