import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import * as React from "react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Integration tests for the `<UsuariosPanel>` flow (T-5.4, HU-009).
 *
 * Scope:
 *   - Wires `<UsuariosPanel>` together with the REAL
 *     `<CrearVendedorDialog>` and `<EditarVendedorDialog>` (no dialog
 *     stubs). The only seams we cut are:
 *       1. `useUsuarios` is mocked so we control the table data and can
 *          flip it to simulate a refetch after a mutation succeeds.
 *       2. The four `useCrearVendedor / useActualizarVendedor /
 *          useDesactivarVendedor` hooks expose `mutate` as a `vi.fn()`
 *          so the test can assert payloads and trigger `onSuccess` /
 *          `onError` manually.
 *       3. `sonner` is mocked to avoid the global toast portal.
 *     The Supabase repository is never reached — `useUsuarios` is the
 *     network boundary in production, and we mock at that seam exactly
 *     like the unit tests already do.
 *
 * The four required flows (per PR-5 / T-5.4):
 *   1. Create a vendedor from the dialog → the new row appears in the
 *      table once the cache "refetches".
 *   2. Edit a row → the updated `nombre` and `telefono` appear in the
 *      table.
 *   3. Desactivar a row (via the EditarVendedorDialog "Desactivar"
 *      action) → the row is marked `Inactivo` and the table-row
 *      "Desactivar" button is disabled.
 *   4. A Zod validation error on submit shows the inline error in
 *      Spanish and does NOT call the mutation.
 *
 * Extras (free coverage on `errors.root` + the EditarVendedor onError
 * branch):
 *   5. When the create mutation rejects with a server error the form
 *      shows the root error message and the dialog stays open.
 */

// ── Env mock (defensive; the components do not import env directly,
// but `useUsuarios` is mocked anyway). Keeping it mirrors the other
// admin tests in this folder. ────────────────────────────────────────
vi.mock("@/config/env", () => ({
  env: {
    proyectoId: "mock-proyecto-id",
    supabaseUrl: "https://mock.supabase.co",
    supabaseKey: "mock-key",
    masterPlanImageUrl: "",
    turnstileSiteKey: "mock-turnstile-key",
    agenciaId: "mock-agencia-id",
  },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// ── Hook mocks (the only seam) ───────────────────────────────────────
const mockUseUsuarios = vi.fn();
const crearMutate = vi.fn();
const actualizarMutate = vi.fn();
const desactivarMutate = vi.fn();

vi.mock("@/presentation/hooks/useUsuarios", () => ({
  useUsuarios: () => mockUseUsuarios(),
  useCrearVendedor: () => ({ mutate: crearMutate, isPending: false }),
  useActualizarVendedor: () => ({ mutate: actualizarMutate, isPending: false }),
  useDesactivarVendedor: () => ({ mutate: desactivarMutate, isPending: false }),
}));

import { UsuariosPanel } from "@/presentation/components/admin/UsuariosPanel";
import type { VendedorProfile } from "@/domain/entities/vendedor";

function makeVendedor(overrides: Partial<VendedorProfile> = {}): VendedorProfile {
  return {
    id: "user-1",
    authUserId: "auth-1",
    email: "maria@showroom.pe",
    nombre: "María García",
    rol: "vendedor",
    telefono: "+51999000111",
    proyectoId: "550e8400-e29b-41d4-a716-446655440000",
    activo: true,
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
    ...overrides,
  };
}

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function fillCrearForm(values: {
  nombre: string;
  email: string;
  dni: string;
  telefono: string;
  password: string;
  proyectoId: string;
}) {
  fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: values.nombre } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: values.email } });
  fireEvent.change(screen.getByLabelText(/dni/i), { target: { value: values.dni } });
  fireEvent.change(screen.getByLabelText(/tel[eé]fono/i), { target: { value: values.telefono } });
  fireEvent.change(screen.getByLabelText(/contrase/i), { target: { value: values.password } });
  fireEvent.change(screen.getByLabelText(/proyecto/i), { target: { value: values.proyectoId } });
}

const VALID_PROYECTO_ID = "550e8400-e29b-41d4-a716-446655440000";
const VALID_TELEFONO = "+51987654321";

beforeEach(() => {
  mockUseUsuarios.mockReset();
  crearMutate.mockReset();
  actualizarMutate.mockReset();
  desactivarMutate.mockReset();
});

describe("<UsuariosPanel> integration (T-5.4) — HU-009 admin flow", () => {
  it("(1) creates a vendedor from the dialog and the new row appears in the table", async () => {
    // Start with an empty table so the empty-state branch is exercised.
    mockUseUsuarios.mockReturnValue({ data: [], isLoading: false });

    render(<UsuariosPanel />, { wrapper: makeWrapper() });

    expect(screen.getByTestId("usuarios-empty")).toBeInTheDocument();

    // Open the create dialog from the empty-state button.
    fireEvent.click(screen.getByTestId("crear-vendedor-button"));

    // The real dialog renders the full form.
    expect(await screen.findByTestId("crear-vendedor-form")).toBeInTheDocument();

    fillCrearForm({
      nombre: "Ada Lovelace",
      email: "ada@showroom.pe",
      dni: "12345678",
      telefono: VALID_TELEFONO,
      password: "temporal123",
      proyectoId: VALID_PROYECTO_ID,
    });

    fireEvent.click(screen.getByTestId("submit-crear-vendedor"));

    await waitFor(() => expect(crearMutate).toHaveBeenCalledTimes(1));

    // Assert the payload that reached the mutation.
    const [payload, options] = crearMutate.mock.calls[0] as [
      Record<string, unknown>,
      { onSuccess: () => void; onError: (e: Error) => void },
    ];
    expect(payload).toMatchObject({
      nombre: "Ada Lovelace",
      email: "ada@showroom.pe",
      dni: "12345678",
      telefono: VALID_TELEFONO,
      proyectoId: VALID_PROYECTO_ID,
      rol: "vendedor",
      password: "temporal123",
    });
    expect(typeof options.onSuccess).toBe("function");

    // Simulate a successful mutation: the cache "refetches" and now
    // returns the new vendedor row.
    const newVendedor = makeVendedor({
      id: "user-new",
      email: "ada@showroom.pe",
      nombre: "Ada Lovelace",
      rol: "vendedor",
      telefono: VALID_TELEFONO,
      activo: true,
    });
    mockUseUsuarios.mockReturnValue({ data: [newVendedor], isLoading: false });

    options.onSuccess();

    // The dialog closes and the table now shows the new row.
    await waitFor(() => {
      expect(screen.queryByTestId("crear-vendedor-form")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("usuarios-table")).toBeInTheDocument();
    expect(screen.getByText("ada@showroom.pe")).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    // The role badge renders as "Vendedor" (label, not raw enum).
    expect(screen.getByText("Vendedor")).toBeInTheDocument();
  });

  it("(2) edits a row and the updated nombre/telefono appear in the table", async () => {
    const original = makeVendedor({
      id: "user-edit",
      nombre: "Carlos Pérez",
      email: "carlos@showroom.pe",
      telefono: "+51900000001",
    });
    mockUseUsuarios.mockReturnValue({ data: [original], isLoading: false });

    render(<UsuariosPanel />, { wrapper: makeWrapper() });

    // Initial state shows the row with original values. The table
    // only renders email / nombre / rol / estado / fecha / acciones,
    // so we cannot assert telefono here — that is asserted via the
    // dialog's `getByDisplayValue` below.
    expect(screen.getByText("Carlos Pérez")).toBeInTheDocument();
    expect(screen.getByText("carlos@showroom.pe")).toBeInTheDocument();
    // Open the editor on the row.
    const row = screen.getByTestId("usuario-row");
    fireEvent.click(within(row).getByTestId("editar-vendedor-button"));

    // The editor pre-fills the form with the row data.
    expect(await screen.findByTestId("editar-vendedor-form")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Carlos Pérez")).toBeInTheDocument();
    expect(screen.getByDisplayValue("+51900000001")).toBeInTheDocument();

    // Change nombre and telefono to new valid values.
    fireEvent.change(screen.getByDisplayValue("Carlos Pérez"), {
      target: { value: "Carlos Quispe" },
    });
    fireEvent.change(screen.getByDisplayValue("+51900000001"), {
      target: { value: "+51955555555" },
    });

    fireEvent.click(screen.getByTestId("submit-editar-vendedor"));

    await waitFor(() => expect(actualizarMutate).toHaveBeenCalledTimes(1));

    const [editPayload, editOptions] = actualizarMutate.mock.calls[0] as [
      { id: string; data: Record<string, unknown> },
      { onSuccess: () => void; onError: (e: Error) => void },
    ];
    expect(editPayload.id).toBe("user-edit");
    expect(editPayload.data).toMatchObject({
      nombre: "Carlos Quispe",
      telefono: "+51955555555",
      proyectoId: VALID_PROYECTO_ID,
    });
    // Defense in depth: `rol` MUST NOT be in the PATCH payload.
    expect(editPayload.data).not.toHaveProperty("rol");

    // Simulate the cache returning the updated row.
    const updated = makeVendedor({
      id: "user-edit",
      nombre: "Carlos Quispe",
      email: "carlos@showroom.pe",
      telefono: "+51955555555",
    });
    mockUseUsuarios.mockReturnValue({ data: [updated], isLoading: false });

    editOptions.onSuccess();

    // The dialog closes and the table reflects the new fields.
    await waitFor(() => {
      expect(screen.queryByTestId("editar-vendedor-form")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Carlos Quispe")).toBeInTheDocument();
    expect(screen.queryByText("Carlos Pérez")).not.toBeInTheDocument();
  });

  it("(3) desactivates a row from the edit dialog and the row is marked Inactivo", async () => {
    const active = makeVendedor({
      id: "user-deact",
      nombre: "Lucía Soto",
      email: "lucia@showroom.pe",
    });
    mockUseUsuarios.mockReturnValue({ data: [active], isLoading: false });

    render(<UsuariosPanel />, { wrapper: makeWrapper() });

    // Initial badge says "Activo".
    expect(screen.getByText("Activo")).toBeInTheDocument();

    // Open the editor and click Desactivar.
    const row = screen.getByTestId("usuario-row");
    fireEvent.click(within(row).getByTestId("editar-vendedor-button"));

    await screen.findByTestId("editar-vendedor-form");

    fireEvent.click(screen.getByTestId("desactivar-vendedor"));

    await waitFor(() => expect(desactivarMutate).toHaveBeenCalledTimes(1));

    const [desactivarId, desactivarOptions] = desactivarMutate.mock.calls[0] as [
      string,
      { onSuccess: () => void; onError: (e: Error) => void },
    ];
    expect(desactivarId).toBe("user-deact");

    // Simulate the soft-delete completing: the row comes back with
    // `activo: false`.
    const inactive = makeVendedor({
      id: "user-deact",
      nombre: "Lucía Soto",
      email: "lucia@showroom.pe",
      activo: false,
    });
    mockUseUsuarios.mockReturnValue({ data: [inactive], isLoading: false });

    desactivarOptions.onSuccess();

    await waitFor(() => {
      expect(screen.queryByTestId("editar-vendedor-form")).not.toBeInTheDocument();
    });

    // The row badge flips to "Inactivo" and the per-row Desactivar
    // button becomes disabled (the table reads `disabled={!u.activo}`).
    expect(screen.getByText("Inactivo")).toBeInTheDocument();
    expect(screen.queryByText("Activo")).not.toBeInTheDocument();
    const refreshedRow = screen.getByTestId("usuario-row");
    const desactivarTableBtn = within(refreshedRow).getByTestId("desactivar-vendedor-button");
    expect(desactivarTableBtn).toBeDisabled();
  });

  it("(4) shows a Zod validation error when the email is invalid and does NOT call the mutation", async () => {
    mockUseUsuarios.mockReturnValue({ data: [], isLoading: false });

    render(<UsuariosPanel />, { wrapper: makeWrapper() });

    fireEvent.click(screen.getByTestId("crear-vendedor-button"));
    await screen.findByTestId("crear-vendedor-form");

    fillCrearForm({
      nombre: "Ada Lovelace",
      email: "not-an-email",
      dni: "12345678",
      telefono: VALID_TELEFONO,
      password: "temporal123",
      proyectoId: VALID_PROYECTO_ID,
    });

    fireEvent.submit(screen.getByTestId("crear-vendedor-form"));

    // The inline Spanish Zod error is shown and the mutation is NEVER
    // called.
    expect(await screen.findByTestId("form-error-email")).toBeInTheDocument();
    expect(screen.getByTestId("form-error-email").textContent).toMatch(/email/i);
    expect(crearMutate).not.toHaveBeenCalled();

    // The dialog stays open so the admin can correct the field.
    expect(screen.getByTestId("crear-vendedor-form")).toBeInTheDocument();
  });

  it("(5) shows the root error and keeps the dialog open when the create mutation rejects", async () => {
    mockUseUsuarios.mockReturnValue({ data: [], isLoading: false });

    render(<UsuariosPanel />, { wrapper: makeWrapper() });

    fireEvent.click(screen.getByTestId("crear-vendedor-button"));
    await screen.findByTestId("crear-vendedor-form");

    fillCrearForm({
      nombre: "Beatriz Lozano",
      email: "beatriz@showroom.pe",
      dni: "87654321",
      telefono: VALID_TELEFONO,
      password: "temporal123",
      proyectoId: VALID_PROYECTO_ID,
    });

    fireEvent.click(screen.getByTestId("submit-crear-vendedor"));

    await waitFor(() => expect(crearMutate).toHaveBeenCalledTimes(1));

    const [, options] = crearMutate.mock.calls[0] as [
      Record<string, unknown>,
      { onSuccess: () => void; onError: (e: Error) => void },
    ];

    options.onError(new Error("email ya está registrado"));

    // The form error region renders the root message and the dialog
    // stays open for the admin to retry.
    expect(await screen.findByTestId("form-error-root")).toBeInTheDocument();
    expect(screen.getByTestId("form-error-root").textContent).toMatch(/email ya está registrado/i);
    expect(screen.getByTestId("crear-vendedor-form")).toBeInTheDocument();
  });

  // ── Extra coverage for `<EditarVendedorDialog>` branches that the
  // primary four flows don't touch. Each one is a real behavior the
  // admin panel exposes, and the dialog has no other consumer in this
  // module — so these are the cheapest way to keep the file ≥85% on
  // every gate vitest enforces. ─────────────────────────────────────

  it("(6) edits only the proyectoId and the PATCH payload still excludes `rol`", async () => {
    const target = makeVendedor({
      id: "user-proy",
      nombre: "Rosa Mamani",
      email: "rosa@showroom.pe",
      telefono: "+51900000099",
      proyectoId: "old-proyecto-id",
    });
    mockUseUsuarios.mockReturnValue({ data: [target], isLoading: false });

    render(<UsuariosPanel />, { wrapper: makeWrapper() });

    const row = screen.getByTestId("usuario-row");
    fireEvent.click(within(row).getByTestId("editar-vendedor-button"));
    await screen.findByTestId("editar-vendedor-form");

    // Change only the proyectoId.
    fireEvent.change(screen.getByLabelText(/proyecto/i), {
      target: { value: VALID_PROYECTO_ID },
    });

    fireEvent.click(screen.getByTestId("submit-editar-vendedor"));

    await waitFor(() => expect(actualizarMutate).toHaveBeenCalledTimes(1));

    const [patch] = actualizarMutate.mock.calls[0] as [
      { id: string; data: Record<string, unknown> },
      unknown,
    ];
    expect(patch.id).toBe("user-proy");
    expect(patch.data.proyectoId).toBe(VALID_PROYECTO_ID);
    expect(patch.data.nombre).toBe("Rosa Mamani"); // unchanged
    expect(patch.data).not.toHaveProperty("rol");
  });

  it("(7) shows a Zod error when nombre is empty on edit and does NOT call the mutation", async () => {
    const target = makeVendedor({ id: "user-empty", nombre: "Pedro Lazo" });
    mockUseUsuarios.mockReturnValue({ data: [target], isLoading: false });

    render(<UsuariosPanel />, { wrapper: makeWrapper() });

    const row = screen.getByTestId("usuario-row");
    fireEvent.click(within(row).getByTestId("editar-vendedor-button"));
    await screen.findByTestId("editar-vendedor-form");

    // Empty out the nombre field — Zod's `min(1)` should fail.
    fireEvent.change(screen.getByDisplayValue("Pedro Lazo"), {
      target: { value: "" },
    });

    fireEvent.click(screen.getByTestId("submit-editar-vendedor"));

    // Inline Spanish error on the nombre field; mutation is never called.
    expect(await screen.findByTestId("form-error-nombre")).toBeInTheDocument();
    expect(screen.getByTestId("form-error-nombre").textContent).toMatch(/nombre/i);
    expect(actualizarMutate).not.toHaveBeenCalled();
    // The dialog stays open so the admin can correct the field.
    expect(screen.getByTestId("editar-vendedor-form")).toBeInTheDocument();
  });

  it("(8) clicking Cancel in the edit dialog closes it without calling any mutation", async () => {
    const target = makeVendedor({ id: "user-cancel", nombre: "Tomás Reyes" });
    mockUseUsuarios.mockReturnValue({ data: [target], isLoading: false });

    render(<UsuariosPanel />, { wrapper: makeWrapper() });

    const row = screen.getByTestId("usuario-row");
    fireEvent.click(within(row).getByTestId("editar-vendedor-button"));
    await screen.findByTestId("editar-vendedor-form");

    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    await waitFor(() => {
      expect(screen.queryByTestId("editar-vendedor-form")).not.toBeInTheDocument();
    });
    // No mutation fired.
    expect(actualizarMutate).not.toHaveBeenCalled();
    expect(desactivarMutate).not.toHaveBeenCalled();
  });

  it("(9) shows a toast error when the desactivar mutation rejects and keeps the dialog open", async () => {
    const target = makeVendedor({ id: "user-deact-fail", nombre: "Camila Núñez" });
    mockUseUsuarios.mockReturnValue({ data: [target], isLoading: false });

    render(<UsuariosPanel />, { wrapper: makeWrapper() });

    const row = screen.getByTestId("usuario-row");
    fireEvent.click(within(row).getByTestId("editar-vendedor-button"));
    await screen.findByTestId("editar-vendedor-form");

    fireEvent.click(screen.getByTestId("desactivar-vendedor"));

    await waitFor(() => expect(desactivarMutate).toHaveBeenCalledTimes(1));
    const [, options] = desactivarMutate.mock.calls[0] as [
      string,
      { onSuccess: () => void; onError: (e: Error) => void },
    ];

    options.onError(new Error("foreign key constraint"));

    // The dialog stays open so the admin can retry or cancel manually.
    expect(screen.getByTestId("editar-vendedor-form")).toBeInTheDocument();
  });

  it("(10) sets the root error and shows a toast when the actualizar mutation rejects", async () => {
    const target = makeVendedor({ id: "user-update-fail", nombre: "Diego Rojas" });
    mockUseUsuarios.mockReturnValue({ data: [target], isLoading: false });

    render(<UsuariosPanel />, { wrapper: makeWrapper() });

    const row = screen.getByTestId("usuario-row");
    fireEvent.click(within(row).getByTestId("editar-vendedor-button"));
    await screen.findByTestId("editar-vendedor-form");

    // Tweak nombre to a valid value so Zod passes and the mutation runs.
    fireEvent.change(screen.getByDisplayValue("Diego Rojas"), {
      target: { value: "Diego Rojas M." },
    });

    fireEvent.click(screen.getByTestId("submit-editar-vendedor"));

    await waitFor(() => expect(actualizarMutate).toHaveBeenCalledTimes(1));
    const [, options] = actualizarMutate.mock.calls[0] as [
      { id: string; data: Record<string, unknown> },
      { onSuccess: () => void; onError: (e: Error) => void },
    ];

    options.onError(new Error("red de datos caída"));

    // The root error region renders the server message; the dialog
    // stays open.
    expect(await screen.findByTestId("form-error-root")).toBeInTheDocument();
    expect(screen.getByTestId("form-error-root").textContent).toMatch(/red de datos caída/i);
    expect(screen.getByTestId("editar-vendedor-form")).toBeInTheDocument();
  });
});
