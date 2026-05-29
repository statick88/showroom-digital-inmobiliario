"use client";

import { useQuery } from "@tanstack/react-query";
import { leadsRepository } from "@/data/repositories";
import { env } from "@/config/env";

export const LEADS_QUERY_KEY = ["leads", env.agenciaId];

export function useLeads() {
  return useQuery({
    queryKey: LEADS_QUERY_KEY,
    queryFn: () => leadsRepository.listarPorAgencia(env.agenciaId),
  });
}
