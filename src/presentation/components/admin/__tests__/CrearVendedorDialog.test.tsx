import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Tests for `<CrearVendedorDialog>` (T-5.2, HU-009).
 *
 * Scope:
 *   - Form renders with all required fields.
 *   - Invalid email shows a Zod error in Spanish.
 *   - Submitting a valid form calls `useCrearVendedor.mutate` with the
 *     correctly shaped payload (incl. the temporary password).
 *   - On mutation success, the dialog closes (caller's `onOpenChange` is
 *     called with `false`).
 */

const useCrearVendedorMutate = vi.fn();
const useCrearVendedorMock = vi.fn();

vi.mock("@/presentation/hooks/useUsuarios", () => ({
  useCrearVendedor: () => useCrearVendedorMock(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { CrearVendedorDialog } from "@/presentation/components/admin/CrearVendedorDialog";

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

beforeEach(() => {
  useCrearVendedorMutate.mockReset();
  useCrearVendedorMock.mockReset();
});

describe("<CrearVendedorDialog> (T-5.2) — admin create vendedor form", () => {
  it("(1) renders the form when open=true with all required fields", () => {
    useCrearVendedorMock.mockReturnValue({
      mutate: useCrearVendedorMutate,
      isPending: false,
    });

    render(<CrearVendedorDialog open={true} onOpenChange={() => {}} />, {
      wrapper: makeWrapper(),
    });

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dni/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tel[eé]fono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contrase/i)).toBeInTheDocument();
  });

  it("(2) does not render anything when open=false", () => {
    useCrearVendedorMock.mockReturnValue({
      mutate: useCrearVendedorMutate,
      isPending: false,
    });

    render(<CrearVendedorDialog open={false} onOpenChange={() => {}} />, {
      wrapper: makeWrapper(),
    });

    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
  });

  it("(3) shows an inline Zod error in Spanish when the email is invalid", async () => {
    useCrearVendedorMock.mockReturnValue({
      mutate: useCrearVendedorMutate,
      isPending: false,
    });

    render(<CrearVendedorDialog open={true} onOpenChange={() => {}} />, {
      wrapper: makeWrapper(),
    });

    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: "Ada Lovelace" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByLabelText(/dni/i), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByLabelText(/tel[eé]fono/i), {
      target: { value: "+51987654321" },
    });
    fireEvent.change(screen.getByLabelText(/contrase/i), {
      target: { value: "temporal123" },
    });

    // Submit the form
    const form = screen.getByTestId("crear-vendedor-form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId("form-error-email")).toBeInTheDocument();
    });
    expect(screen.getByTestId("form-error-email").textContent).toMatch(/email/i);
    // mutate was NOT called
    expect(useCrearVendedorMutate).not.toHaveBeenCalled();
  });

  it("(4) calls useCrearVendedor.mutate with the correctly shaped payload on valid submit", async () => {
    useCrearVendedorMock.mockReturnValue({
      mutate: useCrearVendedorMutate,
      isPending: false,
    });

    const onOpenChange = vi.fn();
    render(<CrearVendedorDialog open={true} onOpenChange={onOpenChange} />, {
      wrapper: makeWrapper(),
    });

    const proyectoId = "550e8400-e29b-41d4-a716-446655440000";

    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: "Ada Lovelace" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "ada@showroom.pe" },
    });
    fireEvent.change(screen.getByLabelText(/dni/i), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByLabelText(/tel[eé]fono/i), {
      target: { value: "+51987654321" },
    });
    fireEvent.change(screen.getByLabelText(/contrase/i), {
      target: { value: "temporal123" },
    });
    fireEvent.change(screen.getByLabelText(/proyecto/i), {
      target: { value: proyectoId },
    });

    fireEvent.click(screen.getByRole("button", { name: /crear/i }));

    await waitFor(() => {
      expect(useCrearVendedorMutate).toHaveBeenCalled();
    });
    const call = useCrearVendedorMutate.mock.calls[0]!;
    const [payload, options] = call as [Record<string, unknown>, { onSuccess: () => void }];
    expect(payload.nombre).toBe("Ada Lovelace");
    expect(payload.email).toBe("ada@showroom.pe");
    expect(payload.dni).toBe("12345678");
    expect(payload.telefono).toBe("+51987654321");
    expect(payload.password).toBe("temporal123");
    expect(payload.proyectoId).toBe(proyectoId);
    expect(typeof options.onSuccess).toBe("function");
  });

  it("(5) closes the dialog on mutation success (calls onOpenChange(false))", async () => {
    useCrearVendedorMock.mockReturnValue({
      mutate: useCrearVendedorMutate,
      isPending: false,
    });

    const onOpenChange = vi.fn();
    render(<CrearVendedorDialog open={true} onOpenChange={onOpenChange} />, {
      wrapper: makeWrapper(),
    });

    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: "Ada Lovelace" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "ada@showroom.pe" },
    });
    fireEvent.change(screen.getByLabelText(/dni/i), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByLabelText(/tel[eé]fono/i), {
      target: { value: "+51987654321" },
    });
    fireEvent.change(screen.getByLabelText(/contrase/i), {
      target: { value: "temporal123" },
    });
    fireEvent.change(screen.getByLabelText(/proyecto/i), {
      target: { value: "550e8400-e29b-41d4-a716-446655440000" },
    });

    fireEvent.click(screen.getByRole("button", { name: /crear/i }));

    await waitFor(() => expect(useCrearVendedorMutate).toHaveBeenCalled());
    // Simulate mutation success
    const onSuccess = useCrearVendedorMutate.mock.calls[0]![1].onSuccess;
    onSuccess();

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
