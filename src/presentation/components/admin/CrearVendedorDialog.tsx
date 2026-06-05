"use client";

/**
 * `<CrearVendedorDialog>` — admin form to create a new vendedor (T-5.2, HU-009).
 *
 * STUB for T-5.1. Filled in fully in T-5.2.
 *
 * The stub keeps the import surface stable so T-5.1 (the table) can be
 * wired and tested without blocking on T-5.2 (the form + Edge Function).
 *
 * Renders nothing when `open` is false. When `open` is true, renders a
 * minimal placeholder so the parent component can verify the open/close
 * state machine.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface CrearVendedorDialogProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}

export function CrearVendedorDialog({ open, onOpenChange }: CrearVendedorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear vendedor (T-5.2)</DialogTitle>
            <DialogDescription>
              Este formulario se implementa en T-5.2.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      )}
    </Dialog>
  );
}
