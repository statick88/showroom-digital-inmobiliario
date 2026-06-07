import { test, expect } from "@playwright/test";

const BASE = "https://statick88.github.io/showroom-digital-inmobiliario";
const ADMIN_EMAIL = "dsaavedra88@gmail.com";
const ADMIN_PASS = "a1b2c3d4*";
const SUPABASE_PROJECT_REF = "ktfmrfhznwqsfziafltr";

// These must be set via environment variables in CI
const ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;

if (!ANON_KEY || !SUPABASE_URL) {
  throw new Error("Missing required environment variables: VITE_SUPABASE_PUBLISHABLE_KEY and VITE_SUPABASE_URL");
}

test.describe("Producción - Verificación funcional", () => {
  test.beforeEach(async ({ page }) => {
    // Get a fresh access token
    const tokenResponse = await page.request.post(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        headers: {
          apikey: ANON_KEY,
          "Content-Type": "application/json",
        },
        data: {
          email: ADMIN_EMAIL,
          password: ADMIN_PASS,
        },
      }
    );
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in;
    const expiresAt = Date.now() + expiresIn * 1000;
    
    const sessionData = {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
      expires_at: expiresAt,
      token_type: "bearer",
      user: tokenData.user,
    };
    
    // Set localStorage BEFORE page load using addInitScript
    await page.addInitScript(([projectRef, session]) => {
      localStorage.setItem(`sb-${projectRef}-auth-token`, JSON.stringify(session));
    }, [SUPABASE_PROJECT_REF, sessionData]);
    
    console.log("Auth session init script added");
  });

  test("01 - Homepage carga y muestra título", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(3000);
    await expect(page).toHaveTitle(/Showroom/);
  });

  test("02 - Ruta /#admin carga el layout principal", async ({ page }) => {
    await page.goto(`${BASE}/#admin`, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(3000);
    await expect(page.locator("#root")).not.toBeEmpty();
  });

  test("03 - Admin panel carga correctamente", async ({ page }) => {
    await page.goto(`${BASE}/#admin`, { waitUntil: "networkidle", timeout: 20000 });
    
    // Wait for the Supabase client to load session from localStorage
    await page.waitForFunction(
      () => document.body.innerText.includes("Admin Panel"),
      { timeout: 30000, polling: 1000 }
    ).catch(() => {
      console.log("Admin Panel did not appear within timeout");
    });

    await page.waitForTimeout(3000);
    await expect(page.getByText("Admin Panel")).toBeVisible({ timeout: 10000 });
  });

  test("04 - Panel métricas Dashboard visibles", async ({ page }) => {
    await page.goto(`${BASE}/#admin`, { waitUntil: "networkidle", timeout: 20000 });
    
    await page.waitForFunction(
      () => document.body.innerText.includes("Admin Panel"),
      { timeout: 30000, polling: 1000 }
    ).catch(() => {
      console.log("Admin Panel did not appear within timeout");
    });

    await page.waitForTimeout(3000);
    // Use getByRole to avoid strict mode violation (multiple "Dashboard" texts)
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Total Lotes")).toBeVisible({ timeout: 5000 });
  });

  test("05 - Pestaña Propiedades carga tabla", async ({ page }) => {
    await page.goto(`${BASE}/#admin`, { waitUntil: "networkidle", timeout: 20000 });
    
    await page.waitForFunction(
      () => document.body.innerText.includes("Admin Panel"),
      { timeout: 30000, polling: 1000 }
    ).catch(() => {
      console.log("Admin Panel did not appear within timeout");
    });

    await page.waitForTimeout(3000);
    
    await page.getByText("Propiedades").click();
    await page.waitForTimeout(3000);
    await expect(page.getByText("Código")).toBeVisible({ timeout: 5000 });
  });

  test("06 - Pestaña Leads carga tabla", async ({ page }) => {
    await page.goto(`${BASE}/#admin`, { waitUntil: "networkidle", timeout: 20000 });
    
    await page.waitForFunction(
      () => document.body.innerText.includes("Admin Panel"),
      { timeout: 30000, polling: 1000 }
    ).catch(() => {
      console.log("Admin Panel did not appear within timeout");
    });

    await page.waitForTimeout(3000);
    
    await page.getByText("Leads").click();
    await page.waitForTimeout(3000);
    await expect(page.getByText("Nombre")).toBeVisible({ timeout: 5000 });
  });
});