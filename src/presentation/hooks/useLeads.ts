"use client";

import { useQuery } from "@tanstack/react-query";
import { leadsRepository } from "@/data/repositories";

const AGENCIA_ID = "a0000000-0000-0000-0000-000000000001";

export const LEADS_QUERY_KEY = ["leads", AGENCIA_ID];

export function useLeads() {
  return useQuery({
    queryKey: LEADS_QUERY_KEY,
    queryFn: () => leadsRepository.listarPorAgencia(AGENCIA_ID),
  });
}
