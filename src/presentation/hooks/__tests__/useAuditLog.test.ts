import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import type { ReactNode } from "react";

/**
 * Tests for the TanStack Query hooks in `useAuditLog`.
 *
 * T-5.5 (PR-5). The hooks are thin wrappers around the audit log repository.
 * We mock the repository and Supabase channel so tests don't need real infra.
 */

import { useAuditLog, useRealtimeAuditLog } from "@/presentation/hooks/useAuditLog";
import type { AuditLogEntry, AuditLogFilters } from "@/domain/repositories/audit-log.repository";

// ── Mock the repository ────────────────────────────────────────────────
const listarMock = vi.fn();

vi.mock("@/data/repositories/supabase-audit-log.repository.impl", () => ({
  auditLogRepository: {
    listar: (...args: unknown[]) => listarMock(...args),
  },
}));

// ── Mock Supabase client for realtime tests ────────────────────────────
const { channelInstance, channelMock, subscribeCallbackRef, removeChannelMock } = vi.hoisted(() => {
  const subscribeCallbackRef: { current: ((status: string) => void) | null } = { current: null };
  const inst = {
    on: vi.fn(),
    subscribe: vi.fn((cb?: (status: string) => void) => {
      subscribeCallbackRef.current = cb ?? null;
      return inst;
    }),
    unsubscribe: vi.fn(),
  };
  return {
    channelInstance: inst,
    channelMock: vi.fn(() => inst),
    subscribeCallbackRef,
    removeChannelMock: vi.fn(),
  };
});

vi.mock("@/lib/supabase/client", () => {
  return {
    supabase: {
      channel: channelMock,
      removeChannel: removeChannelMock,
    },
  };
});

const makeAuditLogEntry = (overrides: Partial<AuditLogEntry> = {}): AuditLogEntry => ({
  id: "audit-1",
  tabla: "propiedades",
  accion: "INSERT",
  actor: "admin@inmobiliaria.pe",
  actorRol: "admin",
  registroId: "prop-1",
  valoresAntiguos: null,
  valoresNuevos: { id: "prop-1", titulo: "Casa en Miraflores", precio: 500000 },
  createdAt: "2026-01-15T10:30:00.000Z",
  ...overrides,
});

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

beforeEach(() => {
  listarMock.mockReset();
  channelInstance.on.mockClear();
  channelInstance.subscribe.mockClear();
  channelInstance.unsubscribe.mockClear();
  channelMock.mockClear();
  removeChannelMock.mockClear();
  subscribeCallbackRef.current = null;
  channelInstance.on.mockImplementation(() => channelInstance);
  channelInstance.subscribe.mockImplementation((cb?: (status: string) => void) => {
    subscribeCallbackRef.current = cb ?? null;
    return channelInstance;
  });
});

describe("useAuditLog (T-5.5) — read hooks", () => {
  it("(1) hook calls repo.listar with filtros when provided", async () => {
    const filtros: AuditLogFilters = {
      tabla: "propiedades",
      accion: "UPDATE",
      page: 0,
      pageSize: 50,
    };
    listarMock.mockResolvedValue({ rows: [makeAuditLogEntry()], total: 1 });

    const { result } = renderHook(() => useAuditLog(filtros), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(listarMock).toHaveBeenCalledWith(filtros);
    // TypeScript narrowing: use explicit type assertion after success check
    const data = result.current.data as
      | { rows: Array<{ tabla: string }>; total: number }
      | undefined;
    expect(data).toBeDefined();
    const rows = data!.rows;
    expect(rows).toHaveLength(1);
    // Access with non-null assertion since we just checked length
    expect(rows[0]!.tabla).toBe("propiedades");
  });

  it("(2) queryKey includes filtros so different filter combinations are cached separately", async () => {
    listarMock.mockResolvedValue({ rows: [makeAuditLogEntry()], total: 1 });

    const filtros1: AuditLogFilters = { tabla: "propiedades" };
    const filtros2: AuditLogFilters = { tabla: "lotes" };

    const { result: result1 } = renderHook(() => useAuditLog(filtros1), { wrapper: makeWrapper() });
    await waitFor(() => expect(result1.current.isSuccess).toBe(true));

    const { result: result2 } = renderHook(() => useAuditLog(filtros2), { wrapper: makeWrapper() });
    await waitFor(() => expect(result2.current.isSuccess).toBe(true));

    // Both calls should have been made with different filters
    expect(listarMock).toHaveBeenCalledTimes(2);
    expect(listarMock).toHaveBeenNthCalledWith(1, filtros1);
    expect(listarMock).toHaveBeenNthCalledWith(2, filtros2);
  });

  it("(3) returns rows and total for pagination UI", async () => {
    const entries = [
      makeAuditLogEntry({ id: "1", tabla: "propiedades" }),
      makeAuditLogEntry({ id: "2", tabla: "lotes" }),
      makeAuditLogEntry({ id: "3", tabla: "transacciones" }),
    ];
    listarMock.mockResolvedValue({ rows: entries, total: 42 });

    const { result } = renderHook(() => useAuditLog({ page: 0, pageSize: 100 }), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data as
      | { rows: Array<{ tabla: string }>; total: number }
      | undefined;
    expect(data).toBeDefined();
    expect(data!.rows).toHaveLength(3);
    expect(data!.total).toBe(42);
  });
});

describe("useRealtimeAuditLog (T-5.5) — realtime subscription", () => {
  it("(4) subscribes to audit_log table on INSERT events", () => {
    renderHook(() => useRealtimeAuditLog(), { wrapper: makeWrapper() });

    expect(channelMock).toHaveBeenCalledWith("audit_log");
    expect(channelInstance.on).toHaveBeenCalledWith(
      "postgres_changes",
      expect.objectContaining({
        event: "INSERT",
        schema: "public",
        table: "audit_log",
      }),
      expect.any(Function),
    );
  });

  it("(5) calls subscribe to establish connection", () => {
    renderHook(() => useRealtimeAuditLog(), { wrapper: makeWrapper() });

    expect(channelInstance.subscribe).toHaveBeenCalled();
  });

  it("(6) on INSERT event, invalidates all queries with prefix ['audit-log']", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    function Wrapper({ children }: { children: ReactNode }) {
      return React.createElement(QueryClientProvider, { client: queryClient }, children);
    }

    renderHook(() => useRealtimeAuditLog(), { wrapper: Wrapper });

    // Wait for subscription to be established
    await act(async () => {
      subscribeCallbackRef.current?.("SUBSCRIBED");
    });

    // Simulate INSERT event payload
    let capturedHandler: ((payload: unknown) => void) | null = null;
    channelInstance.on.mockImplementation(
      (_event: string, _config: unknown, handler: (payload: unknown) => void) => {
        capturedHandler = handler;
        return channelInstance;
      },
    );

    // Re-render to capture the handler
    const { unmount } = renderHook(() => useRealtimeAuditLog(), { wrapper: Wrapper });
    unmount();
    renderHook(() => useRealtimeAuditLog(), { wrapper: Wrapper });

    act(() => {
      capturedHandler?.({
        eventType: "INSERT",
        new: { id: "new-audit-1", tabla: "propiedades", accion: "INSERT" },
        old: {},
        schema: "public",
        table: "audit_log",
      });
    });

    // Should invalidate all audit-log queries
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["audit-log"] });
  });

  it("(7) cleans up channel on unmount", () => {
    const { unmount } = renderHook(() => useRealtimeAuditLog(), { wrapper: makeWrapper() });

    expect(removeChannelMock).not.toHaveBeenCalled();
    unmount();
    expect(removeChannelMock).toHaveBeenCalledWith(channelInstance);
  });
});
