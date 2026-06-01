import { test, expect } from "@playwright/test";

const BASE = "https://statick88.github.io/showroom-digital-inmobiliario";
const ADMIN_EMAIL = "dsaavedra88@gmail.com";
const ADMIN_PASS = "a1b2c3d4*";

test.describe("Producción - Verificación funcional", () => {
  test("01 - Homepage carga y muestra título", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(3000);
    await expect(page).toHaveTitle(/Showroom/);
  });

  test("02 - Ruta /#/app carga el layout principal", async ({ page }) => {
    await page.goto(`${BASE}/#/app`, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(3000);
    await expect(page.locator("#root")).not.toBeEmpty();
  });

  test("03 - Ruta /#/admin muestra formulario de login", async ({ page }) => {
    await page.goto(`${BASE}/#/admin`, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(3000);
    await expect(page.locator("#loginForm")).toBeVisible({ timeout: 10000 });
  });

  test("04 - Login admin exitoso + Dashboard", async ({ page }) => {
    await page.goto(`${BASE}/#/admin`, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(2000);

    // Fill login form
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASS);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(8000);

    // Verify redirected to dashboard
    await expect(page.getByText("Admin Panel")).toBeVisible({ timeout: 10000 });
  });

  test("05 - Panel métricas Dashboard visibles", async ({ page }) => {
    await page.goto(`${BASE}/#/admin`, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASS);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(8000);

    await expect(page.getByText("Dashboard")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Total Lotes")).toBeVisible({ timeout: 5000 });
  });

  test("06 - Pestaña Propiedades carga tabla", async ({ page }) => {
    await page.goto(`${BASE}/#/admin`, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASS);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(8000);

    await page.getByText("Propiedades").click();
    await page.waitForTimeout(3000);
    await expect(page.getByText("Código")).toBeVisible({ timeout: 5000 });
  });

  test("07 - Pestaña Leads carga tabla", async ({ page }) => {
    await page.goto(`${BASE}/#/admin`, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASS);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(8000);

    await page.getByText("Leads").click();
    await page.waitForTimeout(3000);
    await expect(page.getByText("Nombre")).toBeVisible({ timeout: 5000 });
  });
});
