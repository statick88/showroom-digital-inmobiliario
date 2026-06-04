import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";

import { AdminLogin } from "@/presentation/components/admin/AdminLogin";
import { toast } from "sonner";

const { signInMock } = vi.hoisted(() => ({
  signInMock: vi.fn(),
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

beforeEach(() => {
  signInMock.mockReset();
  (toast.error as ReturnType<typeof vi.fn>).mockReset();
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
});
