"use client";

/**
 * `<CrearVendedorDialog>` — admin form to create a new vendedor (T-5.2, HU-009).
 *
 * Flow:
 *   1. Admin fills the form (nombre, email, dni, telefono, proyectoId, rol, password).
 *   2. On submit, the form is validated client-side with the project's
 *      Zod schemas (`crearVendedorSchema` + a password refinement).
 *   3. The payload is forwarded to `useCrearVendedor.mutate`, which
 *      internally calls `usuariosRepository.crear` (T-4.1, PR-4).
 *   4. The repo invokes the Supabase Edge Function `crear-vendedor`,
 *      which uses the service-role key to create the matching
 *      `auth.users` row and the `usuarios_rol` row in a single
 *      transaction.
 *   5. On success, the dialog closes; on error, a toast is shown.
 *
 * Edge Function availability:
 *   If Hans Erik's Supabase project does NOT have Edge Functions enabled,
 *   the `crear` method in `supabase-usuarios.repository.impl.ts` falls
 *   back to the `crear_vendedor` RPC function
 *   (`supabase/migrations/00010_crear_vendedor_rpc.sql`). The dialog is
 *   unaware of the wiring choice — it only knows the mutation contract.
 *
 * Defense in depth (per design #2669):
 *   - The form does NOT include `rol` as a hidden field; the form sets
 *     `rol = "vendedor"` by default. Admin promotion must go through a
 *     separate, controlled flow (out of scope for MVP).
 *   - The form calls the mutation server-side; the Edge Function and
 *     the RPC BOTH verify the caller is `admin` before creating the row.
 *   - The `password` is write-only: the form clears it on submit success
 *     and the parent component never sees it.
 */

import { useState } from "react";
import { z } from "zod";
import { useCrearVendedor } from "@/presentation/hooks/useUsuarios";
import { crearVendedorSchema } from "@/lib/schemas/vendedor";
import { normalizeDni, formatDni } from "@/lib/utils";
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

const passwordSchema = z
  .string()
  .min(8, "contraseña debe tener al menos 8 caracteres")
  .max(72, "contraseña debe tener como máximo 72 caracteres");

type FieldErrors = Partial<Record<keyof FormState | "root", string>>;

interface FormState {
  nombre: string;
  email: string;
  dni: string;
  telefono: string;
  proyectoId: string;
  rol: "admin" | "vendedor" | "comprador";
  password: string;
}

const EMPTY: FormState = {
  nombre: "",
  email: "",
  dni: "",
  telefono: "",
  proyectoId: "",
  rol: "vendedor",
  password: "",
};

export interface CrearVendedorDialogProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}

export function CrearVendedorDialog({ open, onOpenChange }: CrearVendedorDialogProps) {
  const { mutate, isPending } = useCrearVendedor();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});

  // The parent passes `key={crearOpen ? "open" : "closed"}` so the
  // component remounts on every open transition, which resets the
  // form and error state cleanly. No useEffect needed (and Next.js
  // 15's React Compiler flags setState in effects).

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    const next = key === "dni" ? normalizeDni(value as string) : value;
    setForm((prev) => ({ ...prev, [key]: next }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const nextErrors: FieldErrors = {};

    const passwordResult = passwordSchema.safeParse(form.password);
    if (!passwordResult.success) {
      nextErrors.password = passwordResult.error.issues[0]?.message ?? "contraseña inválida";
    }

    // Normalize DNI to digits-only so formatted inputs (12.345.678 / 21-1234567-8)
    // do not fail 8-digit validation unexpectedly. Keep the rest unchanged.
    const normalized = { ...form, dni: normalizeDni(form.dni) };
    const { password: _password, ...payloadForZod } = normalized;
    const result = crearVendedorSchema.safeParse(payloadForZod);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormState | undefined;
        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    mutate(
      {
        ...payloadForZod,
        password: form.password,
      },
      {
        onSuccess: () => {
          setForm(EMPTY);
          setErrors({});
          toast.success("Vendedor creado", {
            description: "Las credenciales fueron enviadas por correo.",
          });
          onOpenChange(false);
        },
        onError: (err) => {
          setErrors({ root: err.message ?? "No se pudo crear el vendedor" });
          toast.error("Error al crear vendedor", {
            description: err.message,
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear vendedor</DialogTitle>
            <DialogDescription>
              El nuevo usuario podrá iniciar sesión con la contraseña temporal y cambiará su clave
              al primer ingreso.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            data-testid="crear-vendedor-form"
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
            />
            <Field
              label="DNI"
              name="dni"
              value={formatDni(form.dni)}
              onChange={(v) => update("dni", v)}
              error={errors.dni}
              testId="field-dni"
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
            <Field
              label="Contraseña temporal"
              name="password"
              type="password"
              value={form.password}
              onChange={(v) => update("password", v)}
              error={errors.password}
              helperText="Mínimo 8 caracteres. El vendedor la cambiará al primer ingreso."
              testId="field-password"
            />

            {errors.root && (
              <p role="alert" data-testid="form-error-root" className="text-sm text-destructive">
                {errors.root}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} data-testid="submit-crear-vendedor">
                {isPending ? "Creando..." : "Crear"}
              </Button>
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
        data-testid={`input-${name}`}
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
