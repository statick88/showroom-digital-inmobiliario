"use client";

import { useQuery } from "@tanstack/react-query";
import { commissionsRepository } from "@/data/repositories";

export function useAllComisiones() {
  return useQuery({
    queryKey: ["comisiones-all"],
    queryFn: () => commissionsRepository.listar(),
  });
}
