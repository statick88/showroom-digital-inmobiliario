import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { rethrowIfPresent } from "@/lib/supabase/errors";
import { toast } from "sonner";

/**
 * @deprecated since PR-1 (T-1.5) of `refactor-lotizacion-fase-3`.
 *
 * This hook writes to the legacy `propiedades` table. The lot-based flow
 * should use `useLoteStatusMutation` (which writes to `lotes`).
 *
 * The body is preserved for back-compat with the Propiedades tab in
 * `AdminDashboard.tsx` (which still uses `usePropiedades.legacy`).
 * PR-5 (Propiedades migration) will swap the import there.
 *
 * @see useLoteStatusMutation
 */
interface StatusChangeData {
  propiedadId: string;
  estado: string;
  cci?: string;
  metodoPago?: string;
}

export function useStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ propiedadId, estado, cci, metodoPago }: StatusChangeData) => {
      const updateData: Record<string, unknown> = { estado };

      if (cci) updateData.cci = cci;
      if (metodoPago) updateData.metodo_pago = metodoPago;

      const { data, error } = await supabase
        .from("propiedades")
        .update(updateData)
        .eq("id", propiedadId)
        .select("*")
        .single();

      rethrowIfPresent(error, "Error al cambiar estado");
      return data;
    },
    onSuccess: () => {
      toast.success("Estado actualizado");
      queryClient.invalidateQueries({ queryKey: ["propiedades"] });
      queryClient.invalidateQueries({ queryKey: ["metricas"] });
    },
    onError: (error: Error) => {
      toast.error("Error al actualizar", {
        description: error.message,
      });
    },
  });
}
