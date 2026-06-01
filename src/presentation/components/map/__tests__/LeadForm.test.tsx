import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

// ── Mock leads repository ──────────────────────────────────────────
const mockCrear = vi.fn();
vi.mock("@/data/repositories/leads.repository.impl", () => ({
  leadsRepository: {
    crear: (...args: unknown[]) => mockCrear(...args),
  },
}));

// ── Mock sonner toast ──────────────────────────────────────────────
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

// ── Mock Turnstile (auto-trigger onSuccess async) ──────────────────
vi.mock("@marsidev/react-turnstile", () => ({
  Turnstile: ({ onSuccess }: { onSuccess: (token: string) => void }) => {
    setTimeout(() => onSuccess("mock-turnstile-token"), 0);
    return <div data-testid="turnstile-widget" />;
  },
}));

// ── Mock localStorage (not available in test jsdom) ────────────────
interface SimpleStorage {
  [key: string]: string;
}
const createMockStorage = () => {
  const store: SimpleStorage = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
};

const MOCK_PROPERTY = { id: "prop-123", codigo: "LT-999" };
const MOCK_NOW = 1_700_000_000_000;

beforeEach(() => {
  vi.clearAllMocks();
  // Provide a working localStorage for tests
  Object.defineProperty(window, "localStorage", {
    value: createMockStorage(),
    writable: true,
  });
  // Mock fetch for IP anonymization
  vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("192.168.1.42\n"));
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ════════════════════════════════════════════════════════════════════
// 5.8 │ LeadForm — Standard tests
// ════════════════════════════════════════════════════════════════════
describe("5.8 LeadForm — Information request form", () => {
  const onClose = vi.fn();

  it("renders form fields: Nombre, Email, Teléfono with +51 prefix", async () => {
    const { LeadForm } = await import("@/presentation/components/map/LeadForm");
    render(<LeadForm onClose={onClose} propiedad={MOCK_PROPERTY} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/nombre/i)).toBeTruthy();
      expect(screen.getByLabelText(/email/i)).toBeTruthy();
      expect(screen.getByLabelText(/teléfono/i)).toBeTruthy();
    });

    // +51 prefix should be visible
    expect(screen.getByText("+51")).toBeTruthy();
  });

  it("shows property code in the heading", async () => {
    const { LeadForm } = await import("@/presentation/components/map/LeadForm");
    render(<LeadForm onClose={onClose} propiedad={MOCK_PROPERTY} />);

    await waitFor(() => {
      expect(screen.getByText(/LT-999/)).toBeTruthy();
    });
  });

  it("renders close button with Cerrar aria-label", async () => {
    const { LeadForm } = await import("@/presentation/components/map/LeadForm");
    render(<LeadForm onClose={onClose} propiedad={MOCK_PROPERTY} />);

    expect(screen.getByLabelText("Cerrar")).toBeTruthy();
  });

  it("submit button is disabled until privacy checkbox is checked", async () => {
    const { LeadForm } = await import("@/presentation/components/map/LeadForm");
    render(<LeadForm onClose={onClose} propiedad={MOCK_PROPERTY} />);

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: "Juan Pérez" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "juan@example.com" },
    });

    // Wait for Turnstile async callback to fire
    await waitFor(() => {
      expect(screen.getByTestId("turnstile-widget")).toBeTruthy();
    });

    // Button should be disabled because LPDP checkbox is unchecked
    const submitBtn = screen.getByRole("button", {
      name: /enviar solicitud/i,
    }) as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);

    // Check the LPDP privacy checkbox
    const privacyCheckbox = screen.getByRole("checkbox");
    fireEvent.click(privacyCheckbox);

    // Button should now be enabled
    expect(submitBtn.disabled).toBe(false);
  });

  it("shows success toast and calls onClose after successful submit", async () => {
    const { toast } = await import("sonner");
    mockCrear.mockResolvedValueOnce({});

    const { LeadForm } = await import("@/presentation/components/map/LeadForm");
    render(<LeadForm onClose={onClose} propiedad={MOCK_PROPERTY} />);

    // Fill form
    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: "Juan Pérez" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "juan@example.com" },
    });

    // Wait for Turnstile
    await waitFor(() => {
      expect(screen.getByTestId("turnstile-widget")).toBeTruthy();
    });

    // Check privacy
    fireEvent.click(screen.getByRole("checkbox"));

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /enviar solicitud/i }));

    await waitFor(() => {
      expect(mockCrear).toHaveBeenCalledWith(
        expect.objectContaining({
          propiedadId: "prop-123",
          nombre: "Juan Pérez",
          email: "juan@example.com",
        }),
      );
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Solicitud enviada", {
        description: "Nos pondremos en contacto contigo pronto.",
      });
    });

    // After the 2s timeout, onClose should be called
    await waitFor(
      () => {
        expect(onClose).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });

  it("shows error toast when creación fails", async () => {
    const { toast } = await import("sonner");
    mockCrear.mockRejectedValueOnce(new Error("Database error"));

    const { LeadForm } = await import("@/presentation/components/map/LeadForm");
    render(<LeadForm onClose={onClose} propiedad={MOCK_PROPERTY} />);

    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: "Juan Pérez" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "juan@example.com" },
    });

    await waitFor(() => {
      expect(screen.getByTestId("turnstile-widget")).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /enviar solicitud/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error al enviar", {
        description: "Database error",
      });
    });
  });
});

// ════════════════════════════════════════════════════════════════════
// 5.8 │ LeadForm — 30s throttle tests with Date.now mocking
// ════════════════════════════════════════════════════════════════════
describe("5.8 LeadForm — 30s throttle", () => {
  const onClose = vi.fn();
  let dateNowSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "localStorage", {
      value: createMockStorage(),
      writable: true,
    });
    dateNowSpy = vi.spyOn(Date, "now").mockReturnValue(MOCK_NOW);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("192.168.1.42\n"));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows throttle message when previous submission was under 30s ago", async () => {
    // Set localStorage to simulate a submission 10s ago
    window.localStorage.setItem("lead_submit_ts", String(MOCK_NOW - 10_000));

    const { LeadForm } = await import("@/presentation/components/map/LeadForm");
    render(<LeadForm onClose={onClose} propiedad={MOCK_PROPERTY} />);

    // 30_000 - 10_000 = 20_000ms = ~20s remaining
    await waitFor(() => {
      expect(screen.getByText(/espera/)).toBeTruthy();
      expect(screen.getByText(/20/)).toBeTruthy();
    });
  });

  it("blocks re-submission and disables button when throttled", async () => {
    // Set localStorage to simulate a submission 5s ago
    window.localStorage.setItem("lead_submit_ts", String(MOCK_NOW - 5_000));
    mockCrear.mockResolvedValueOnce({});

    const { LeadForm } = await import("@/presentation/components/map/LeadForm");
    render(<LeadForm onClose={onClose} propiedad={MOCK_PROPERTY} />);

    // The submit button should be disabled due to throttle
    const submitBtn = screen.getByRole("button", {
      name: /enviar solicitud/i,
    }) as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);

    // Try to submit via form event (belt-and-suspenders)
    const form = submitBtn.closest("form")!;
    fireEvent.submit(form);

    // crear should NOT have been called because throttle blocked it
    expect(mockCrear).not.toHaveBeenCalled();
  });
});
