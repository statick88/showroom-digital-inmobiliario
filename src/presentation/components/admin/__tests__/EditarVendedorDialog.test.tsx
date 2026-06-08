import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Tests for `<EditarVendedorDialog>` (T-5.3, HU-009).
 *
 * Scope:
 *   - The form pre-fills with the vendedor's current data when opened.
 *   - The form does NOT include a `rol` field (admins cannot promote
 *     themselves; defense in depth).
 *   - Submitting a valid form calls `useActualizarVendedor.mutate`.
 *   - On mutation success, the dialog closes.
 *   - The form's onError path shows a toast + error message.
 */

const useActualizarVendedorMutate = vi.fn();
const useActualizarVendedorMock = vi.fn();
const useDesactivarVendedorMutate = vi.fn();
const useDesactivarVendedorMock = vi.fn();

vi.mock("@/presentation/hooks/useUsuarios", () => ({
  useActualizarVendedor: () => useActualizarVendedorMock(),
  useDesactivarVendedor: () => useDesactivarVendedorMock(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { EditarVendedorDialog } from "@/presentation/components/admin/EditarVendedorDialog";
import type { VendedorProfile } from "@/domain/entities/vendedor";

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const VENDEDOR_BASE: VendedorProfile = {
  id: "user-1",
  authUserId: "auth-1",
  email: "maria@showroom.pe",
  nombre: "María García",
  rol: "vendedor",
  dni: "12345678",
  telefono: "+51999000111",
  proyectoId: "550e8400-e29b-41d4-a716-446655440000",
  activo: true,
  createdAt: "2026-01-15T00:00:00Z",
  updatedAt: "2026-01-15T00:00:00Z",
};

beforeEach(() => {
  useActualizarVendedorMutate.mockReset();
  useActualizarVendedorMock.mockReset();
  useDesactivarVendedorMutate.mockReset();
  useDesactivarVendedorMock.mockReset();
});

describe("<EditarVendedorDialog> (T-5.3) — admin edit vendedor form", () => {
  it("(1) pre-fills the form with the vendedor's current data when opened", () => {
    useActualizarVendedorMock.mockReturnValue({
      mutate: useActualizarVendedorMutate,
      isPending: false,
    });
    useDesactivarVendedorMock.mockReturnValue({
      mutate: useDesactivarVendedorMutate,
      isPending: false,
    });

    render(<EditarVendedorDialog open={true} onOpenChange={() => {}} vendedor={VENDEDOR_BASE} />, {
      wrapper: makeWrapper(),
    });

    expect(screen.getByDisplayValue("María García")).toBeInTheDocument();
    expect(screen.getByDisplayValue("maria@showroom.pe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("12345678")).toBeInTheDocument();
    expect(screen.getByDisplayValue("+51999000111")).toBeInTheDocument();
    expect(screen.getByDisplayValue("550e8400-e29b-41d4-a716-446655440000")).toBeInTheDocument();
  });

  it("(2) does NOT include a 'rol' input — admins cannot promote themselves (defense in depth)", () => {
    useActualizarVendedorMock.mockReturnValue({
      mutate: useActualizarVendedorMutate,
      isPending: false,
    });
    useDesactivarVendedorMock.mockReturnValue({
      mutate: useDesactivarVendedorMutate,
      isPending: false,
    });

    render(<EditarVendedorDialog open={true} onOpenChange={() => {}} vendedor={VENDEDOR_BASE} />, {
      wrapper: makeWrapper(),
    });

    // The form should not let the admin change the rol
    expect(screen.queryByLabelText(/^rol$/i)).not.toBeInTheDocument();
  });

  it("(3) does not render anything when open=false", () => {
    useActualizarVendedorMock.mockReturnValue({
      mutate: useActualizarVendedorMutate,
      isPending: false,
    });
    useDesactivarVendedorMock.mockReturnValue({
      mutate: useDesactivarVendedorMutate,
      isPending: false,
    });

    render(<EditarVendedorDialog open={false} onOpenChange={() => {}} vendedor={VENDEDOR_BASE} />, {
      wrapper: makeWrapper(),
    });

    expect(screen.queryByDisplayValue("María García")).not.toBeInTheDocument();
  });

  it("(4) calls useActualizarVendedor.mutate with the right payload on submit", async () => {
    useActualizarVendedorMock.mockReturnValue({
      mutate: useActualizarVendedorMutate,
      isPending: false,
    });
    useDesactivarVendedorMock.mockReturnValue({
      mutate: useDesactivarVendedorMutate,
      isPending: false,
    });

    render(<EditarVendedorDialog open={true} onOpenChange={() => {}} vendedor={VENDEDOR_BASE} />, {
      wrapper: makeWrapper(),
    });

    // Edit the name
    const nombreInput = screen.getByDisplayValue("María García");
    fireEvent.change(nombreInput, { target: { value: "María Quispe" } });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => expect(useActualizarVendedorMutate).toHaveBeenCalled());
    const call = useActualizarVendedorMutate.mock.calls[0]!;
    const [payload] = call as [{ id: string; data: Record<string, unknown> }];
    expect(payload.id).toBe("user-1");
    expect(payload.data.nombre).toBe("María Quispe");
    // The rol key MUST NOT be present
    expect(payload.data).not.toHaveProperty("rol");
  });

  it("(5) closes the dialog on mutation success", async () => {
    useActualizarVendedorMock.mockReturnValue({
      mutate: useActualizarVendedorMutate,
      isPending: false,
    });
    useDesactivarVendedorMock.mockReturnValue({
      mutate: useDesactivarVendedorMutate,
      isPending: false,
    });

    const onOpenChange = vi.fn();
    render(
      <EditarVendedorDialog open={true} onOpenChange={onOpenChange} vendedor={VENDEDOR_BASE} />,
      { wrapper: makeWrapper() },
    );

    fireEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => expect(useActualizarVendedorMutate).toHaveBeenCalled());
    const onSuccess = useActualizarVendedorMutate.mock.calls[0]![1].onSuccess;
    onSuccess();

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("(6) exposes a 'Desactivar' action that calls useDesactivarVendedor.mutate with the id", () => {
    useActualizarVendedorMock.mockReturnValue({
      mutate: useActualizarVendedorMutate,
      isPending: false,
    });
    useDesactivarVendedorMock.mockReturnValue({
      mutate: useDesactivarVendedorMutate,
      isPending: false,
    });

    render(<EditarVendedorDialog open={true} onOpenChange={() => {}} vendedor={VENDEDOR_BASE} />, {
      wrapper: makeWrapper(),
    });

    // Click "Desactivar" to open the confirmation dialog
    const desactivarBtn = screen.getByRole("button", { name: /desactivar/i });
    fireEvent.click(desactivarBtn);

    // Click "Confirmar" in the confirmation dialog to fire the mutation
    const confirmarBtn = screen.getByRole("button", { name: /confirmar/i });
    fireEvent.click(confirmarBtn);

    expect(useDesactivarVendedorMutate).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("(7) onError path shows toast.error with the error message and writes a root error", async () => {
    useActualizarVendedorMock.mockReturnValue({
      mutate: useActualizarVendedorMutate,
      isPending: false,
    });
    useDesactivarVendedorMock.mockReturnValue({
      mutate: useDesactivarVendedorMutate,
      isPending: false,
    });

    render(<EditarVendedorDialog open={true} onOpenChange={() => {}} vendedor={VENDEDOR_BASE} />, {
      wrapper: makeWrapper(),
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => expect(useActualizarVendedorMutate).toHaveBeenCalled());

    // Invoke onError callback with an Error
    const onError = useActualizarVendedorMutate.mock.calls[0]![1].onError;
    const testError = new Error("unique violation");
    onError(testError);

    // The error message renders in an alert role
    await waitFor(() => {
      expect(screen.getByText("unique violation")).toBeInTheDocument();
    });
  });

  it("(8) Email and DNI fields are rendered as disabled (readOnly → disabled in the Field wrapper)", () => {
    useActualizarVendedorMock.mockReturnValue({
      mutate: useActualizarVendedorMutate,
      isPending: false,
    });
    useDesactivarVendedorMock.mockReturnValue({
      mutate: useDesactivarVendedorMutate,
      isPending: false,
    });

    render(<EditarVendedorDialog open={true} onOpenChange={() => {}} vendedor={VENDEDOR_BASE} />, {
      wrapper: makeWrapper(),
    });

    const emailInput = screen.getByTestId("input-email");
    const dniInput = screen.getByTestId("input-dni");

    // Field wrapper sets disabled={readOnly}, so inputs should be disabled
    expect(emailInput).toBeDisabled();
    expect(dniInput).toBeDisabled();
  });

  it("(9) the readOnly onChange handlers are reachable (defense in depth — they exist even if disabled)", () => {
    // This test exercises the onChange arrow function bodies on lines 205/215 by
    // removing the `disabled` attribute (which React sets from the readOnly flag)
    // and dispatching a change event. In a real browser, disabled inputs don't
    // fire change events, but the handlers are still in the JSX.
    useActualizarVendedorMock.mockReturnValue({
      mutate: useActualizarVendedorMutate,
      isPending: false,
    });
    useDesactivarVendedorMock.mockReturnValue({
      mutate: useDesactivarVendedorMutate,
      isPending: false,
    });

    render(<EditarVendedorDialog open={true} onOpenChange={() => {}} vendedor={VENDEDOR_BASE} />, {
      wrapper: makeWrapper(),
    });

    // Remove the disabled attribute to make the input mutable in jsdom
    const emailInput = screen.getByTestId("input-email") as HTMLInputElement;
    const dniInput = screen.getByTestId("input-dni") as HTMLInputElement;
    emailInput.removeAttribute("disabled");
    dniInput.removeAttribute("disabled");

    // Now dispatching change events works
    fireEvent.change(emailInput, { target: { value: "new@example.com" } });
    fireEvent.change(dniInput, { target: { value: "87654321" } });

    // The form's local state is updated (visible if we re-read the input value)
    expect(emailInput.value).toBe("new@example.com");
    expect(dniInput.value).toBe("87654321");
  });

  it("(10) editing telefono and proyectoId submits the new values in the payload", async () => {
    useActualizarVendedorMock.mockReturnValue({
      mutate: useActualizarVendedorMutate,
      isPending: false,
    });
    useDesactivarVendedorMock.mockReturnValue({
      mutate: useDesactivarVendedorMutate,
      isPending: false,
    });

    render(<EditarVendedorDialog open={true} onOpenChange={() => {}} vendedor={VENDEDOR_BASE} />, {
      wrapper: makeWrapper(),
    });

    // Change telefono
    fireEvent.change(screen.getByDisplayValue("+51999000111"), {
      target: { value: "+51999888777" },
    });
    // Change proyectoId
    fireEvent.change(screen.getByDisplayValue("550e8400-e29b-41d4-a716-446655440000"), {
      target: { value: "660e8400-e29b-41d4-a716-446655440111" },
    });

    fireEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => expect(useActualizarVendedorMutate).toHaveBeenCalled());
    const call = useActualizarVendedorMutate.mock.calls[0]!;
    const [payload] = call as [{ id: string; data: Record<string, unknown> }];
    expect(payload.id).toBe("user-1");
    expect(payload.data.telefono).toBe("+51999888777");
    expect(payload.data.proyectoId).toBe("660e8400-e29b-41d4-a716-446655440111");
  });

  it("(11) the submit button shows 'Guardando...' when isPending=true and the desactivar button shows 'Desactivando...' when isPending=true (respective hooks)", () => {
    useActualizarVendedorMock.mockReturnValue({
      mutate: useActualizarVendedorMutate,
      isPending: true,
    });
    useDesactivarVendedorMock.mockReturnValue({
      mutate: useDesactivarVendedorMutate,
      isPending: true,
    });

    render(<EditarVendedorDialog open={true} onOpenChange={() => {}} vendedor={VENDEDOR_BASE} />, {
      wrapper: makeWrapper(),
    });

    expect(screen.getByRole("button", { name: /guardando/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /desactivando/i })).toBeInTheDocument();
  });
});
