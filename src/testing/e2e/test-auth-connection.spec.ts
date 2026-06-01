import { test, expect } from "@playwright/test";

const BASE = "https://statick88.github.io/showroom-digital-inmobiliario";
const ADMIN_EMAIL = "dsaavedra88@gmail.com";
const ADMIN_PASS = "a1b2c3d4*";

test.describe("Supabase Connection Test", () => {
  test("should show env vars are loaded (no missing env var error)", async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto(BASE, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(3000);

    // Check for the specific env var error we were seeing
    const envVarError = errors.find(
      (e) => e.includes("Missing required env var") && e.includes("VITE_PROYECTO_ID"),
    );
    console.log("Console errors:", errors);
    console.log("Env var error found:", envVarError);

    expect(envVarError).toBeFalsy(); // Should not have the env var error anymore
  });

  test("should attempt admin login with credentials", async ({ page }) => {
    await page.goto(`${BASE}/#/admin`, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(3000);

    // Check if we're seeing the login form (not redirected yet)
    const loginFormVisible = await page
      .locator("#loginForm")
      .isVisible()
      .catch(() => false);
    console.log("Login form visible on first load:", loginFormVisible);

    if (loginFormVisible) {
      // Try to log in
      await page.fill('input[name="email"]', ADMIN_EMAIL);
      await page.fill('input[name="password"]', ADMIN_PASS);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);

      // Check if login succeeded (should see Admin Panel or be redirected to dashboard)
      const adminPanelVisible = await page
        .getByText("Admin Panel")
        .isVisible()
        .catch(() => false);
      const dashboardVisible = await page
        .locator("text=Dashboard")
        .isVisible()
        .catch(() => false);
      const stillOnLoginPage = await page
        .locator("#loginForm")
        .isVisible()
        .catch(() => false);

      console.log("After login attempt:");
      console.log("  Admin Panel visible:", adminPanelVisible);
      console.log("  Dashboard visible:", dashboardVisible);
      console.log("  Still on login page:", stillOnLoginPage);

      // If login failed, we should still see the login form or get redirected back
      // If login succeeded, we should see Admin Panel or Dashboard
      expect(adminPanelVisible || dashboardVisible || !stillOnLoginPage).toBeTruthy();
    } else {
      // If we're not seeing the login form, we might have been redirected already
      const url = page.url();
      console.log("Current URL (not seeing login form):", url);

      // Check if we're on the app route (redirected) or if there's some other content
      const hasWelcomeText = await page
        .locator("text=Bienvenido")
        .isVisible()
        .catch(() => false);
      const hasExploreText = await page
        .locator("text=Explora nuestro proyecto")
        .isVisible()
        .catch(() => false);

      console.log("Has welcome text:", hasWelcomeText);
      console.log("Has explore text:", hasExploreText);
    }
  });
});
