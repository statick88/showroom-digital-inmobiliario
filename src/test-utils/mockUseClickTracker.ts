import { vi } from "vitest";

/**
 * Shared mock for `useClickTracker` used by retro tests for the Fase 1+2
 * lot components (T-1.1, T-1.2). Lets each test assert that `trackClick`
 * was invoked with the right `propiedadId` / `tipoEvento` pair.
 *
 * The real hook also reads `crypto.randomUUID()` and `localStorage`, so
 * stubbing it here keeps the tests fast and deterministic.
 */
export interface UseClickTrackerMock {
  trackClick: ReturnType<typeof vi.fn>;
  isTracking: boolean;
}

export function createMockUseClickTracker(
  overrides: Partial<UseClickTrackerMock> = {},
): UseClickTrackerMock {
  return {
    trackClick: vi.fn(),
    isTracking: false,
    ...overrides,
  };
}
