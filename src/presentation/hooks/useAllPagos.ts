"use client";

import { useQuery } from "@tanstack/react-query";
import { pagosRepository } from "@/data/repositories";

export function useAllPagos() {
  return useQuery({
    queryKey: ["pagos-all"],
    queryFn: () => pagosRepository.findAll(),
  });
}
