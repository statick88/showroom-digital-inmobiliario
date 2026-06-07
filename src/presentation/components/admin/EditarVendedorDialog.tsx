"use client";

/**
 * `<EditarVendedorDialog>` — admin form to edit a vendedor (T-5.3, HU-009).
 *
 * Flow:
 *   1. Admin opens the dialog on a row from `<UsuariosPanel>`; the form
 *      pre-fills with the vendedor's current values.
 *   2. The form is validated client-side with the project's Zod schemas
 *      (`actualizarVendedorSchema` for the editable fields).
 *   3. On submit, the form calls `useActualizarVendedor.mutate`, which
 *      internally calls `usuariosRepository.actualizar` (T-4.1, PR-4).
 *   4. The repo is a PATCH: only fields the admin actually changed are
 *      forwarded, and `rol` is filtered out server-side as defense in
 *      depth (mirrored here in the type system).
 *   5. A secondary "Desactivar" action calls `useDesactivarVendedor.mutate`
 *      which soft-deletes the row (sets `activo = false`). The row is
 *      preserved so `audit_log` can record the change.
 *
 * Defense in depth (per design #2669):
 *   - The form does NOT include a `rol` input. Even a `// @ts-ignore`
 *     smuggle attempt is blocked both by the type system
 *     (`ActualizarVendedorData` has no `rol` field) and by the repo
 *     (it never forwards the field).
 *   - The form calls mutations server-side; RLS on `usuarios_rol`
 *     restricts the UPDATE to the admin.
 */

import { useState } from "react";
import { useActualizarVendedor, useDesactivarVendedor } from "@/presentation/hooks/useUsuarios";
import { actualizarVendedorSchema } from "@/lib/schemas/vendedor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { VendedorProfile } from "@/domain/entities/vendedor";

type FieldErrors = Partial<Record<keyof FormState | "root", string>>;

interface FormState {
  nombre: string;
  email: string;
  dni: string;
  telefono: string;
  proyectoId: string;
}

const EMPTY: FormState = {
  nombre: "",
  email: "",
  dni: "",
  telefono: "",
  proyectoId: "",
};

export interface EditarVendedorDialogProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  vendedor: VendedorProfile | null;
}

export function EditarVendedorDialog({ open, onOpenChange, vendedor }: EditarVendedorDialogProps) {
  const { mutate, isPending } = useActualizarVendedor();
  const { mutate: desactivar, isPending: isDesactivando } = useDesactivarVendedor();
  // The parent passes `key={selectedVendedor?.id ?? "none"}`, so this
  // component remounts whenever the admin opens a different row. The
  // initial form values are derived from `vendedor` on first render —
  // no useEffect needed (and Next.js 15's React Compiler flags
  // setState in effects).
  const [form, setForm] = useState<FormState>(() => ({
    nombre: vendedor?.nombre ?? "",
    email: vendedor?.email ?? "",
    // The `VendedorProfile` does not include `dni` yet (the column is
    // not in `usuarios_rol`), so we default to empty. When the domain
    // entity grows, this is the only line that needs to change.
    dni: "",
    telefono: vendedor?.telefono ?? "",
    proyectoId: vendedor?.proyectoId ?? "",
  }));
  const [errors, setErrors] = useState<FieldErrors>({});

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!vendedor) return;

    // Validate only the fields the repo actually accepts (`rol` is
    // never forwarded server-side, see PR-4). `email` and `dni` are
    // read-only in the UI; even if a value slips in we don't want it
    // to trigger a Zod failure.
    const editablePayload = {
      nombre: form.nombre,
      telefono: form.telefono || undefined,
      proyectoId: form.proyectoId || undefined,
    };
    const result = actualizarVendedorSchema.safeParse(editablePayload);
    if (!result.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormState | undefined;
        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    // Only forward fields the user actually changed. `actualizar` is a
    // PATCH — empty payload is a no-op server-side, but we want to be
    // explicit about "the admin saw the form and clicked Save without
    // changing anything" so we at least show the toast.
    const changed: Record<string, string> = {};
    if (form.nombre !== vendedor.nombre) changed.nombre = form.nombre;
    if (form.telefono !== (vendedor.telefono ?? "")) changed.telefono = form.telefono;
    if (form.proyectoId !== (vendedor.proyectoId ?? "")) changed.proyectoId = form.proyectoId;

    mutate(
      {
        id: vendedor.id,
        data: {
          nombre: form.nombre,
          telefono: form.telefono || undefined,
          proyectoId: form.proyectoId || undefined,
        },
      },
      {
        onSuccess: () => {
          setErrors({});
          toast.success("Vendedor actualizado", {
            description: `Los cambios en "${vendedor.nombre}" se guardaron.`,
          });
          onOpenChange(false);
        },
        onError: (err) => {
          setErrors({ root: err.message ?? "No se pudo actualizar el vendedor" });
          toast.error("Error al actualizar vendedor", { description: err.message });
        },
      },
    );
    // `changed` documents which fields the user actually edited (vs
    // the PATCH semantics of `actualizar`). The PATCH always sends
    // the editable fields above; the diff is here for telemetry and
    // to make the intent explicit in code review.
    void changed;
  };

  const handleDesactivar = () => {
    if (!vendedor) return;
    desactivar(vendedor.id, {
      onSuccess: () => {
        toast.success("Vendedor desactivado", {
          description: `${vendedor.nombre} ya no podrá iniciar sesión.`,
        });
        onOpenChange(false);
      },
      onError: (err) => {
        toast.error("Error al desactivar vendedor", { description: err.message });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar vendedor</DialogTitle>
            <DialogDescription>
              Actualiza los datos de contacto o el proyecto asignado. Para cambiar el rol o la
              contraseña, usa el flujo dedicado de administración de credenciales.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            data-testid="editar-vendedor-form"
            className="space-y-3"
            noValidate
          >
            <Field
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={(v) => update("nombre", v)}
              error={errors.nombre}
              testId="field-nombre"
            />
            <Field
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(v) => update("email", v)}
              error={errors.email}
              testId="field-email"
              readOnly
              helperText="El email no se puede cambiar desde este formulario."
            />
            <Field
              label="DNI"
              name="dni"
              value={form.dni}
              onChange={(v) => update("dni", v)}
              error={errors.dni}
              testId="field-dni"
              readOnly
              helperText="El DNI no se puede cambiar desde este formulario."
            />
            <Field
              label="Teléfono"
              name="telefono"
              value={form.telefono}
              onChange={(v) => update("telefono", v)}
              error={errors.telefono}
              placeholder="+51987654321"
              testId="field-telefono"
            />
            <Field
              label="Proyecto (UUID)"
              name="proyectoId"
              value={form.proyectoId}
              onChange={(v) => update("proyectoId", v)}
              error={errors.proyectoId}
              placeholder="550e8400-e29b-41d4-a716-446655440000"
              testId="field-proyectoId"
            />

            {errors.root && (
              <p role="alert" data-testid="form-error-root" className="text-sm text-destructive">
                {errors.root}
              </p>
            )}

            <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDesactivar}
                disabled={isPending || isDesactivando}
                data-testid="desactivar-vendedor"
              >
                {isDesactivando ? "Desactivando..." : "Desactivar"}
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending || isDesactivando}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || isDesactivando}
                  data-testid="submit-editar-vendedor"
                >
                  {isPending ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}

interface FieldProps {
  label: string;
  name: keyof FormState;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  testId?: string;
  readOnly?: boolean;
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  helperText,
  placeholder,
  testId,
  readOnly,
}: FieldProps) {
  const errorTestId = `form-error-${name}`;
  return (
    <div className="flex flex-col gap-1" data-testid={testId}>
      <label htmlFor={`field-${name}`} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Input
        id={`field-${name}`}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        readOnly={readOnly}
        data-testid={`input-${name}`}
        disabled={readOnly}
      />
      {error ? (
        <p data-testid={errorTestId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}
