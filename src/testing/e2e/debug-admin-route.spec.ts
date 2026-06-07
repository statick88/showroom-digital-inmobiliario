import { test, expect } from "@playwright/test";

const BASE = "https://statick88.github.io/showroom-digital-inmobiliario";

test.describe("Debug Admin Route", () => {
  test("should show what's rendered at /#admin", async ({ page }) => {
    await page.goto(`${BASE}/#admin`, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(3000);

    // Get full HTML content
    const html = await page.content();
    console.log("=== FULL HTML AT /#/admin ===");
    console.log(html.substring(0, 2000));

    // Check for login form elements
    const loginForm = await page.locator("#loginForm").count();
    const emailInput = await page.locator('input[name="email"]').count();
    const passwordInput = await page.locator('input[name="password"]').count();
    const submitButton = await page.locator('button[type="submit"]').count();

    console.log(`=== ELEMENT COUNTS ===`);
    console.log(`loginForm: ${loginForm}`);
    console.log(`emailInput: ${emailInput}`);
    console.log(`passwordInput: ${passwordInput}`);
    console.log(`submitButton: ${submitButton}`);

    // Check for redirect indicators
    const url = page.url();
    console.log(`Current URL: ${url}`);

    // Check for common text that would indicate we're on homepage vs admin
    const hasWelcomeText = await page
      .locator("text=Bienvenido")
      .isVisible()
      .catch(() => false);
    const hasExploreText = await page
      .locator("text=Explora nuestro proyecto")
      .isVisible()
      .catch(() => false);
    const hasAdminPanel = await page
      .locator("text=Admin Panel")
      .isVisible()
      .catch(() => false);

    console.log(`Has 'Bienvenido' text: ${hasWelcomeText}`);
    console.log(`Has 'Explora nuestro proyecto' text: ${hasExploreText}`);
    console.log(`Has 'Admin Panel' text: ${hasAdminPanel}`);
  });
});
