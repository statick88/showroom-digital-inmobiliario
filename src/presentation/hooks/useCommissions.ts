import { useQuery } from "@tanstack/react-query";
import { commissionsRepository } from "@/data/repositories";

export function useCommissions(vendedorId?: string) {
  return useQuery({
    queryKey: ["commissions", vendedorId],
    queryFn: () => commissionsRepository.listarPorVendedor(vendedorId!),
    enabled: !!vendedorId,
  });
}

export function useCommissionRules() {
  return useQuery({
    queryKey: ["commission-rules"],
    queryFn: () => commissionsRepository.listarReglas(),
  });
}
