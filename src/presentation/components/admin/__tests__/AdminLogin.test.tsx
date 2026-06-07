import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";

import { AdminLogin } from "@/presentation/components/admin/AdminLogin";
import { toast } from "sonner";
import { useAuthStore } from "@/presentation/hooks/useAuthStore";

const { signInMock, getByAuthUserMock } = vi.hoisted(() => ({
  signInMock: vi.fn(),
  getByAuthUserMock: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: signInMock,
    },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock("@/data/repositories", () => ({
  usuariosRepository: {
    getByAuthUserId: (...args: unknown[]) => getByAuthUserMock(...args),
  },
}));

beforeEach(() => {
  signInMock.mockReset();
  getByAuthUserMock.mockReset();
  (toast.error as ReturnType<typeof vi.fn>).mockReset();
  // Reset the auth store to a known state
  useAuthStore.setState({
    id: null,
    authUserId: null,
    email: null,
    nombre: null,
    rol: null,
    proyectoId: null,
    sessionChecked: false,
  });
});

describe("AdminLogin", () => {
  it("(1) returns early without calling supabase when email is empty (early-return branch)", async () => {
    const { container } = render(<AdminLogin />);
    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();
    fireEvent.submit(form!);
    // signInWithPassword should NOT be called
    await waitFor(() => {
      expect(signInMock).not.toHaveBeenCalled();
    });
  });

  it("(2) returns early without calling supabase when password is empty", async () => {
    const { container } = render(<AdminLogin />);
    const form = container.querySelector("form");
    fireEvent.submit(form!);
    await waitFor(() => {
      expect(signInMock).not.toHaveBeenCalled();
    });
  });

  it("(3) calls onLogin on successful sign-in (no error)", async () => {
    signInMock.mockResolvedValue({ error: null });
    const onLogin = vi.fn();
    const { container } = render(<AdminLogin onLogin={onLogin} />);

    // Set email and password via change events
    const inputs = container.querySelectorAll("input");
    fireEvent.change(inputs[0]!, { target: { value: "ada@example.com" } });
    fireEvent.change(inputs[1]!, { target: { value: "secret" } });

    const form = container.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith({
        email: "ada@example.com",
        password: "secret",
      });
    });
    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledTimes(1);
    });
  });

  it("(4) shows toast.error when supabase returns an error (error branch)", async () => {
    signInMock.mockResolvedValue({ error: { message: "Invalid credentials" } });
    const onLogin = vi.fn();
    const { container } = render(<AdminLogin onLogin={onLogin} />);

    const inputs = container.querySelectorAll("input");
    fireEvent.change(inputs[0]!, { target: { value: "ada@example.com" } });
    fireEvent.change(inputs[1]!, { target: { value: "wrong" } });

    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Error de autenticación",
        expect.objectContaining({ description: "Invalid credentials" }),
      );
    });
    expect(onLogin).not.toHaveBeenCalled();
  });

  it("(5) shows the toggle-password button and changes type when clicked", () => {
    const { container } = render(<AdminLogin />);
    const passwordInput = container.querySelector("input[type='password']") as HTMLInputElement;
    expect(passwordInput).toBeInTheDocument();

    const toggleBtn = container.querySelector("button[type='button']")!;
    fireEvent.click(toggleBtn);
    expect((container.querySelector("input")! as HTMLInputElement).value).toBeDefined();
    // After clicking toggle, the password input should be type="text"
    const updated = container.querySelector("input[name='password']")!;
    expect((updated as HTMLInputElement).type).toBe("text");
  });

  it("(6) on successful sign-in WITH data.user.id, hydrates the auth store from usuarios_rol and calls onLogin", async () => {
    signInMock.mockResolvedValue({
      error: null,
      data: { user: { id: "auth-1" } },
    });
    getByAuthUserMock.mockResolvedValue({
      id: "user-1",
      authUserId: "auth-1",
      email: "ada@example.com",
      nombre: "Ada Lovelace",
      rol: "admin",
      telefono: null,
      activo: true,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    });

    const onLogin = vi.fn();
    const { container } = render(<AdminLogin onLogin={onLogin} />);

    const inputs = container.querySelectorAll("input");
    fireEvent.change(inputs[0]!, { target: { value: "ada@example.com" } });
    fireEvent.change(inputs[1]!, { target: { value: "secret" } });
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => {
      expect(getByAuthUserMock).toHaveBeenCalledWith("auth-1");
    });
    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledTimes(1);
    });

    // The auth store must be hydrated so RoleGuard can render.
    const state = useAuthStore.getState();
    expect(state.rol).toBe("admin");
    expect(state.email).toBe("ada@example.com");
    expect(state.nombre).toBe("Ada Lovelace");
    expect(state.sessionChecked).toBe(true);
  });

  it("(7) when auth.users has no matching usuarios_rol row, fires 'Sin rol asignado' toast and does NOT call onLogin", async () => {
    signInMock.mockResolvedValue({
      error: null,
      data: { user: { id: "auth-orphan" } },
    });
    getByAuthUserMock.mockResolvedValue(null);

    const onLogin = vi.fn();
    const { container } = render(<AdminLogin onLogin={onLogin} />);

    const inputs = container.querySelectorAll("input");
    fireEvent.change(inputs[0]!, { target: { value: "orphan@x.com" } });
    fireEvent.change(inputs[1]!, { target: { value: "secret" } });
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Sin rol asignado",
        expect.objectContaining({ description: expect.any(String) }),
      );
    });
    expect(onLogin).not.toHaveBeenCalled();
    // The store is reset, so the next render treats the user as anon.
    expect(useAuthStore.getState().rol).toBeNull();
  });

  it("(8) when signIn throws (network error), the catch block fires 'Error' toast", async () => {
    signInMock.mockRejectedValueOnce(new Error("Network down"));

    const { container } = render(<AdminLogin onLogin={vi.fn()} />);

    const inputs = container.querySelectorAll("input");
    fireEvent.change(inputs[0]!, { target: { value: "ada@example.com" } });
    fireEvent.change(inputs[1]!, { target: { value: "secret" } });
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Error",
        expect.objectContaining({ description: "Intenta de nuevo más tarde." }),
      );
    });
  });
});
