import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// ── Mock env ───────────────────────────────────────────────────────
vi.mock("@/config/env", () => ({
  env: {
    proyectoId: "mock-proyecto-id",
    supabaseUrl: "https://mock.supabase.co",
    supabaseKey: "mock-key",
    masterPlanImageUrl: "",
    turnstileSiteKey: "mock-turnstile-key",
  },
}));

// ── Mock supabase ──────────────────────────────────────────────────
const mockSignInWithPassword = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
    },
  },
}));

// ── Mock sonner toast ──────────────────────────────────────────────
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// ════════════════════════════════════════════════════════════════════
// 5.6 │ AdminLogin
// ════════════════════════════════════════════════════════════════════
describe("5.6 AdminLogin — Login form", () => {
  const onLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email and password inputs", async () => {
    const { AdminLogin } = await import("@/presentation/components/admin/AdminLogin");
    render(<AdminLogin />);

    expect(screen.getByLabelText("Correo electrónico")).toBeTruthy();
    expect(screen.getByLabelText("Contraseña")).toBeTruthy();
    expect(screen.getByPlaceholderText("nombre@inmobiliaria.pe")).toBeTruthy();
    expect(screen.getByPlaceholderText("••••••••")).toBeTruthy();
  });

  it("renders submit button with 'Ingresar' text", async () => {
    const { AdminLogin } = await import("@/presentation/components/admin/AdminLogin");
    render(<AdminLogin />);

    expect(screen.getByText("Ingresar")).toBeTruthy();
  });

  it("password input type toggles when visibility button is clicked", async () => {
    const { AdminLogin } = await import("@/presentation/components/admin/AdminLogin");
    render(<AdminLogin />);

    const passwordInput = screen.getByLabelText("Contraseña") as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    // Click the visibility toggle button
    const toggleButtons = screen
      .getByLabelText("Contraseña")
      .closest(".relative")
      ?.querySelectorAll("button");
    const toggleBtn = toggleButtons?.[0];
    expect(toggleBtn).toBeTruthy();
    fireEvent.click(toggleBtn!);

    expect(passwordInput.type).toBe("text");
  });

  it("calls supabase.auth.signInWithPassword on submit with email and password", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: null });

    const { AdminLogin } = await import("@/presentation/components/admin/AdminLogin");
    render(<AdminLogin onLogin={onLogin} />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "admin@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "secret123" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /ingresar/i }).closest("form")!);

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "admin@test.com",
        password: "secret123",
      });
    });
  });

  it("shows error toast when supabase returns an error", async () => {
    const { toast } = await import("sonner");
    mockSignInWithPassword.mockResolvedValueOnce({
      error: { message: "Invalid login credentials" },
    });

    const { AdminLogin } = await import("@/presentation/components/admin/AdminLogin");
    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "wrong@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "wrongpass" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /ingresar/i }).closest("form")!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error de autenticación", {
        description: "Invalid login credentials",
      });
    });
  });

  it("shows generic error toast when supabase throws an exception", async () => {
    const { toast } = await import("sonner");
    mockSignInWithPassword.mockRejectedValueOnce(new Error("Network error"));

    const { AdminLogin } = await import("@/presentation/components/admin/AdminLogin");
    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "admin@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "secret123" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /ingresar/i }).closest("form")!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error", {
        description: "Intenta de nuevo más tarde.",
      });
    });
  });

  it("calls onLogin callback when sign in succeeds", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: null });

    const { AdminLogin } = await import("@/presentation/components/admin/AdminLogin");
    render(<AdminLogin onLogin={onLogin} />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "admin@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "secret123" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /ingresar/i }).closest("form")!);

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalled();
    });
  });
});
