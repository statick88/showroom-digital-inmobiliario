import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { OfflineIndicator } from "../OfflineIndicator";

// Mock the useOnlineStatus hook
vi.mock("@/presentation/hooks/useOnlineStatus", () => ({
  useOnlineStatus: vi.fn(),
}));

import { useOnlineStatus } from "@/presentation/hooks/useOnlineStatus";

describe("OfflineIndicator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when online", () => {
    (useOnlineStatus as ReturnType<typeof vi.fn>).mockReturnValue(true);
    
    const { container } = render(<OfflineIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it("shows indicator when offline", () => {
    (useOnlineStatus as ReturnType<typeof vi.fn>).mockReturnValue(false);
    
    render(<OfflineIndicator />);
    expect(screen.getByText("Modo offline")).toBeInTheDocument();
  });

  it("displays WifiOff icon when offline", () => {
    (useOnlineStatus as ReturnType<typeof vi.fn>).mockReturnValue(false);
    
    render(<OfflineIndicator />);
    const icon = screen.getByTestId("wifi-off-icon");
    expect(icon).toBeInTheDocument();
  });

  it("has correct styling when offline", () => {
    (useOnlineStatus as ReturnType<typeof vi.fn>).mockReturnValue(false);
    
    render(<OfflineIndicator />);
    const indicator = screen.getByTestId("offline-indicator");
    expect(indicator).toHaveClass("fixed");
    expect(indicator).toHaveClass("bottom-4");
    expect(indicator).toHaveClass("left-4");
    expect(indicator).toHaveClass("z-50");
  });

  it("updates visibility when online status changes", () => {
    const useOnlineStatusMock = useOnlineStatus as ReturnType<typeof vi.fn>;
    useOnlineStatusMock.mockReturnValue(true);
    
    const { rerender } = render(<OfflineIndicator />);
    expect(screen.queryByTestId("offline-indicator")).not.toBeInTheDocument();
    
    // Simulate going offline
    useOnlineStatusMock.mockReturnValue(false);
    rerender(<OfflineIndicator />);
    expect(screen.getByTestId("offline-indicator")).toBeInTheDocument();
    
    // Simulate going back online
    useOnlineStatusMock.mockReturnValue(true);
    rerender(<OfflineIndicator />);
    expect(screen.queryByTestId("offline-indicator")).not.toBeInTheDocument();
  });
});