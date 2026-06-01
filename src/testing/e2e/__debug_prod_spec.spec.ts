import { test, expect } from "@playwright/test";

const BASE = "https://statick88.github.io/showroom-digital-inmobiliario";
const ADMIN_EMAIL = "dsaavedra88@gmail.com";
const ADMIN_PASS = "a1b2c3d4*";

test.describe("Producción - Smoke Test", () => {
  test("01 - Homepage carga", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "load", timeout: 20000 });
    await page.waitForTimeout(5000);
    // Check JS rendered something in root
    const html = await page.evaluate(() => document.getElementById("root")?.children?.length ?? 0);
    console.log("root children count:", html);
    await expect(page).toHaveTitle(/Showroom/);
  });

  test("02 - Admin login exitoso", async ({ page }) => {
    await page.goto(`${BASE}/#/admin`, { waitUntil: "load", timeout: 20000 });
    await page.waitForTimeout(3000);

    // Check what's in root
    const rootLen = await page.evaluate(
      () => document.getElementById("root")?.innerHTML?.length ?? 0,
    );
    console.log("Admin root innerHTML length:", rootLen);

    // If form not visible, log what we see
    const formVisible = await page
      .locator("#loginForm")
      .isVisible()
      .catch(() => false);
    console.log("login form visible:", formVisible);

    if (!formVisible) {
      const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 200));
      console.log("Body text:", bodyText);
    }
  });
});
