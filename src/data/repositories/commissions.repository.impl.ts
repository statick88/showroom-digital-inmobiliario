import { supabase } from "@/lib/supabase/client";
import { rethrowIfPresent } from "@/lib/supabase/errors";
import type { CommissionsRepository } from "@/domain/repositories/commissions.repository";
import type {
  Commission,
  CommissionRule,
  CommissionStatus,
} from "@/domain/entities/commission";

function mapCommission(row: Record<string, unknown>): Commission {
  return {
    id: row.id as string,
    vendedorId: row.vendedor_id as string,
    propertyId: row.property_id as string,
    salePrice: row.sale_price as number,
    commissionAmount: row.commission_amount as number,
    ruleApplied: (row.rule_applied as string) ?? undefined,
    status: row.status as CommissionStatus,
    sunatInvoiceId: (row.sunat_invoice_id as string) ?? undefined,
    createdAt: row.created_at as string,
  };
}

function mapCommissionRule(row: Record<string, unknown>): CommissionRule {
  return {
    id: row.id as string,
    minPrice: row.min_price as number,
    maxPrice: (row.max_price as number) ?? null,
    percentage: row.percentage as number,
    description: (row.description as string) ?? "",
    active: row.active as boolean,
  };
}

export const commissionsRepository: CommissionsRepository = {
  async listar() {
    const { data, error } = await supabase
      .from("vendedor_commissions")
      .select("*")
      .order("created_at", { ascending: false });

    rethrowIfPresent(error, "Error al cargar comisiones");
    return (data ?? []).map((row) => mapCommission(row as Record<string, unknown>));
  },

  async listarPorVendedor(vendedorId: string) {
    const { data, error } = await supabase
      .from("vendedor_commissions")
      .select("*")
      .eq("vendedor_id", vendedorId)
      .order("created_at", { ascending: false });

    rethrowIfPresent(error, "Error al cargar comisiones del vendedor");
    return (data ?? []).map((row) => mapCommission(row as Record<string, unknown>));
  },

  async crear({ vendedorId, propertyId, salePrice }) {
    const { data: rules, error: rulesError } = await supabase
      .from("commission_rules")
      .select("*")
      .eq("active", true)
      .order("min_price", { ascending: true });

    rethrowIfPresent(rulesError, "Error al cargar reglas de comisión");

    const activeRules = (rules ?? []).map((r) =>
      mapCommissionRule(r as Record<string, unknown>),
    );

    const applicable = activeRules.find(
      (r) =>
        salePrice >= r.minPrice &&
        (r.maxPrice === null || salePrice <= r.maxPrice),
    );

    const commissionAmount = applicable
      ? salePrice * (applicable.percentage / 100)
      : 0;

    const { data, error } = await supabase
      .from("vendedor_commissions")
      .insert({
        vendedor_id: vendedorId,
        property_id: propertyId,
        sale_price: salePrice,
        commission_amount: commissionAmount,
        rule_applied: applicable?.description ?? "No rule matched",
        status: "pending",
      })
      .select("*")
      .single();

    rethrowIfPresent(error, "Error al crear comisión");
    return mapCommission(data as Record<string, unknown>);
  },

  async cambiarEstado(id, status) {
    const { data, error } = await supabase
      .from("vendedor_commissions")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single();

    rethrowIfPresent(error, "Error al actualizar estado de comisión");
    return mapCommission(data as Record<string, unknown>);
  },

  async listarReglas() {
    const { data, error } = await supabase
      .from("commission_rules")
      .select("*")
      .eq("active", true)
      .order("min_price", { ascending: true });

    rethrowIfPresent(error, "Error al cargar reglas de comisión");
    return (data ?? []).map((row) =>
      mapCommissionRule(row as Record<string, unknown>),
    );
  },
};
