import { test, expect } from "@playwright/test";

const BASE = "https://statick88.github.io/showroom-digital-inmobiliario";
const ADMIN_EMAIL = "dsaavedra88@gmail.com";
const ADMIN_PASS = "a1b2c3d4*";

test.describe("Admin Login Test", () => {
  test("should load admin login form", async ({ page }) => {
    await page.goto(`${BASE}/#/admin`, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(3000);

    const formVisible = await page.locator("#loginForm").isVisible();
    console.log("Admin login form visible:", formVisible);

    if (!formVisible) {
      const bodyText = await page.evaluate(() => document.body.innerText);
      console.log("Body text:", bodyText.substring(0, 500));

      // Check for error messages
      const pageText = await page.evaluate(() => document.documentElement.innerText);
      console.log("Full page text:", pageText.substring(0, 500));
    }

    expect(formVisible).toBeTruthy();
  });

  test("should login admin successfully", async ({ page }) => {
    await page.goto(`${BASE}/#/admin`, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(2000);

    // Fill login form
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASS);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(8000);

    // Verify redirected to dashboard
    const adminPanelVisible = await page
      .getByText("Admin Panel")
      .isVisible()
      .catch(() => false);
    console.log("Admin Panel visible:", adminPanelVisible);

    expect(adminPanelVisible).toBeTruthy();
  });
});
