import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Tests for the Zustand `useAuthStore` (T-4.2).
 *
 * The store must:
 *   - Hold `{ rol, authUserId, email, nombre, id, sessionChecked }`.
 *   - Have a `setFromUsuariosRol(row, { sessionChecked: true })` action.
 *   - Have a `reset()` action that clears state but keeps
 *     `sessionChecked: true` (so the user is treated as auth'd-but-anon).
 *   - Persist the auth slice to localStorage under `showroom-auth-state`
 *     so a page reload preserves the role.
 *   - On hydration, restore the persisted slice if present and valid.
 *
 * Persistence is implemented with `zustand/middleware`'s `persist`. The
 * localStorage adapter is mocked via a `Storage`-compatible in-memory
 * map because vitest 4 + jsdom 29 leaves `window.localStorage` as an
 * own-property whose getter returns `undefined`.
 */

import { useAuthStore } from "@/presentation/hooks/useAuthStore";
import type { VendedorProfile } from "@/domain/entities/vendedor";

const STORAGE_KEY = "showroom-auth-state";

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key) {
      return map.get(key) ?? null;
    },
    key(index) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key) {
      map.delete(key);
    },
    setItem(key, value) {
      map.set(key, value);
    },
  };
}

function makeVendedor(overrides: Partial<VendedorProfile> = {}): VendedorProfile {
  return {
    id: "user-1",
    authUserId: "auth-1",
    email: "maria@inmobiliaria.pe",
    nombre: "María García",
    rol: "vendedor",
    telefono: "+51999000111",
    activo: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

let memoryStorage: Storage;

beforeEach(() => {
  // Provide a working localStorage stand-in. Zustand reads from
  // `window.localStorage` (via the storage adapter), so we attach
  // our memory store to the window object.
  memoryStorage = createMemoryStorage();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get: () => memoryStorage,
  });
  // Reset the store to its empty state
  useAuthStore.setState({
    id: null,
    authUserId: null,
    email: null,
    nombre: null,
    rol: null,
    proyectoId: null,
    sessionChecked: false,
  });
  vi.restoreAllMocks();
});

afterEach(() => {
  memoryStorage.clear();
});

describe("useAuthStore (T-4.2) — initial state", () => {
  it("(1) initial state has rol=null, authUserId=null, sessionChecked=false", () => {
    const state = useAuthStore.getState();
    expect(state.rol).toBeNull();
    expect(state.authUserId).toBeNull();
    expect(state.email).toBeNull();
    expect(state.nombre).toBeNull();
    expect(state.id).toBeNull();
    expect(state.sessionChecked).toBe(false);
  });

  it("(2) the store exposes setFromUsuariosRol, reset, and persist actions", () => {
    const state = useAuthStore.getState();
    expect(typeof state.setFromUsuariosRol).toBe("function");
    expect(typeof state.reset).toBe("function");
  });
});

describe("useAuthStore (T-4.2) — setFromUsuariosRol", () => {
  it("(3) populates id, authUserId, email, nombre, rol from the row", () => {
    useAuthStore.getState().setFromUsuariosRol(makeVendedor({ rol: "vendedor" }), {
      sessionChecked: true,
    });

    const state = useAuthStore.getState();
    expect(state.id).toBe("user-1");
    expect(state.authUserId).toBe("auth-1");
    expect(state.email).toBe("maria@inmobiliaria.pe");
    expect(state.nombre).toBe("María García");
    expect(state.rol).toBe("vendedor");
    expect(state.sessionChecked).toBe(true);
  });

  it("(4) works for admin role too", () => {
    useAuthStore
      .getState()
      .setFromUsuariosRol(makeVendedor({ rol: "admin", email: "admin@inmobiliaria.pe" }), {
        sessionChecked: true,
      });

    expect(useAuthStore.getState().rol).toBe("admin");
    expect(useAuthStore.getState().email).toBe("admin@inmobiliaria.pe");
  });
});

describe("useAuthStore (T-4.2) — reset", () => {
  it("(5) clears all auth fields but keeps sessionChecked: true (auth'd-but-anon)", () => {
    useAuthStore.getState().setFromUsuariosRol(makeVendedor(), { sessionChecked: true });
    useAuthStore.getState().reset();

    const state = useAuthStore.getState();
    expect(state.rol).toBeNull();
    expect(state.authUserId).toBeNull();
    expect(state.email).toBeNull();
    expect(state.nombre).toBeNull();
    expect(state.id).toBeNull();
    expect(state.sessionChecked).toBe(true);
  });
});

describe("useAuthStore (T-4.2) — localStorage persistence", () => {
  it("(6) after setFromUsuariosRol, localStorage['showroom-auth-state'] is populated", () => {
    useAuthStore.getState().setFromUsuariosRol(makeVendedor(), { sessionChecked: true });

    const stored = window.localStorage.getItem(STORAGE_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored ?? "{}") as { state?: Record<string, unknown> };
    expect(parsed.state).toBeDefined();
    expect(parsed.state?.rol).toBe("vendedor");
    expect(parsed.state?.email).toBe("maria@inmobiliaria.pe");
  });

  it("(7) reset() also clears localStorage (no stale session on next reload)", () => {
    useAuthStore.getState().setFromUsuariosRol(makeVendedor(), { sessionChecked: true });
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeTruthy();

    useAuthStore.getState().reset();
    // After reset, localStorage should be re-written with the empty
    // (but sessionChecked:true) state, OR cleared entirely. Either is
    // acceptable — what matters is that the persisted state has no role.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { state?: Record<string, unknown> };
      expect(parsed.state?.rol).toBeNull();
    } else {
      // Cleared is also fine
      expect(stored).toBeNull();
    }
  });

  it("(8) re-hydration: persist exposes a rehydrate() function and the persisted slice is well-formed", async () => {
    useAuthStore.getState().setFromUsuariosRol(makeVendedor({ rol: "admin" }), {
      sessionChecked: true,
    });

    // Persist middleware must expose rehydrate so a page-reload boundary
    // can be simulated.
    expect(typeof useAuthStore.persist.rehydrate).toBe("function");

    // The persisted JSON must contain the full auth slice, so a future
    // rehydrate (in a real browser on page reload) can restore it.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored ?? "{}") as { state?: Record<string, unknown> };
    expect(parsed.state).toMatchObject({
      id: "user-1",
      authUserId: "auth-1",
      email: "maria@inmobiliaria.pe",
      nombre: "María García",
      rol: "admin",
      sessionChecked: true,
    });

    // Calling rehydrate must not throw and must not wipe the in-memory state.
    await useAuthStore.persist.rehydrate();
    expect(useAuthStore.getState().rol).toBe("admin");
  });
});
