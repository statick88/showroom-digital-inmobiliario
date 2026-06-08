import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WhatsAppButton } from "@/presentation/components/whatsapp/WhatsAppButton";

// Mock the useWhatsApp hook
vi.mock("@/presentation/hooks/useWhatsApp", () => ({
  useWhatsApp: vi.fn(),
}));

import { useWhatsApp } from "@/presentation/hooks/useWhatsApp";

const mockUseWhatsApp = vi.mocked(useWhatsApp);

function makeProps(overrides: Partial<React.ComponentProps<typeof WhatsAppButton>> = {}) {
  return {
    propertyName: "Departamento Miraflores",
    price: 450000,
    vendedorPhone: "51999888777",
    propertyId: "prop-123",
    ...overrides,
  };
}

describe("WhatsAppButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWhatsApp.mockReturnValue({
      openWhatsApp: vi.fn(),
      isTracking: false,
    });
  });

  it("renders the WhatsApp button with correct text", () => {
    render(<WhatsAppButton {...makeProps()} />);
    expect(screen.getByRole("button", { name: /whatsapp/i })).toBeInTheDocument();
  });

  it("does not render when vendedorPhone is empty", () => {
    render(<WhatsAppButton {...makeProps({ vendedorPhone: "" })} />);
    expect(screen.queryByRole("button", { name: /whatsapp/i })).not.toBeInTheDocument();
  });

  it("does not render when vendedorPhone is undefined", () => {
    render(<WhatsAppButton {...makeProps({ vendedorPhone: undefined as unknown as string })} />);
    expect(screen.queryByRole("button", { name: /whatsapp/i })).not.toBeInTheDocument();
  });

  it("calls openWhatsApp when clicked", () => {
    const openWhatsApp = vi.fn();
    mockUseWhatsApp.mockReturnValue({ openWhatsApp, isTracking: false });

    render(<WhatsAppButton {...makeProps()} />);
    fireEvent.click(screen.getByRole("button", { name: /whatsapp/i }));

    expect(openWhatsApp).toHaveBeenCalledTimes(1);
  });

  it("shows loading state when isTracking is true", () => {
    mockUseWhatsApp.mockReturnValue({
      openWhatsApp: vi.fn(),
      isTracking: true,
    });

    render(<WhatsAppButton {...makeProps()} />);
    const button = screen.getByRole("button", { name: /whatsapp/i });
    expect(button).toBeDisabled();
  });

  it("renders with sm size variant", () => {
    render(<WhatsAppButton {...makeProps({ size: "sm" })} />);
    const button = screen.getByRole("button", { name: /whatsapp/i });
    expect(button).toBeInTheDocument();
  });

  it("renders with lg size variant", () => {
    render(<WhatsAppButton {...makeProps({ size: "lg" })} />);
    const button = screen.getByRole("button", { name: /whatsapp/i });
    expect(button).toBeInTheDocument();
  });
});
