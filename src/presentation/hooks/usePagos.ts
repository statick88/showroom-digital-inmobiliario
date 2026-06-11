import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pagosRepository } from "@/data/repositories";
import type { CrearPagoData } from "@/domain/entities/pago";

export function usePagos(transaccionId: string | undefined) {
  return useQuery({
    queryKey: ["pagos", transaccionId],
    queryFn: () => pagosRepository.findByTransaccionId(transaccionId!),
    enabled: Boolean(transaccionId),
  });
}

export function useTotalPagado(transaccionId: string | undefined) {
  return useQuery({
    queryKey: ["pagos-total", transaccionId],
    queryFn: () => pagosRepository.getTotalPagado(transaccionId!),
    enabled: Boolean(transaccionId),
  });
}

export function useCrearPago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CrearPagoData) => pagosRepository.create(data),
    onSuccess: (_result, variables) => {
      qc.invalidateQueries({ queryKey: ["pagos", variables.transaccionId] });
      qc.invalidateQueries({ queryKey: ["pagos-total", variables.transaccionId] });
    },
  });
}