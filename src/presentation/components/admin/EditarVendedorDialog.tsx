"use client";

/**
 * `<EditarVendedorDialog>` — admin form to edit a vendedor (T-5.3, HU-009).
 *
 * STUB for T-5.1. Filled in fully in T-5.3.
 *
 * The stub keeps the import surface stable so T-5.1 (the table) can be
 * wired and tested without blocking on T-5.3 (the form + desactivar).
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { VendedorProfile } from "@/domain/entities/vendedor";

export interface EditarVendedorDialogProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  vendedor: VendedorProfile | null;
}

export function EditarVendedorDialog({
  open,
  onOpenChange,
  vendedor,
}: EditarVendedorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar vendedor (T-5.3)</DialogTitle>
            <DialogDescription>
              Editando a {vendedor?.nombre ?? "(sin vendedor)"}. El formulario se implementa en
              T-5.3.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      )}
    </Dialog>
  );
}
