import { test, expect } from "@playwright/test";

const BASE = "https://statick88.github.io/showroom-digital-inmobiliario";

test.describe("Debug Supabase Initialization", () => {
  test("should log all errors during initialization", async ({ page }) => {
    const errors: string[] = [];
    const consoleLogs: string[] = [];

    page.on("console", (msg) => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });
    page.on("pageerror", (err) => {
      errors.push(`PAGE_ERROR: ${err.message}`);
      consoleLogs.push(`PAGE_ERROR: ${err.message}`);
    });

    // Navigate to homepage first to see if any errors occur there
    await page.goto(BASE, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(2000);

    // Then navigate to admin to see if auth fails
    await page.goto(`${BASE}/#/admin`, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(2000);

    // Get any localStorage or sessionStorage info that might help
    const storageInfo = await page.evaluate(() => {
      return {
        localStorageKeys: Object.keys(localStorage),
        sessionStorageKeys: Object.keys(sessionStorage),
        hasSupabaseSession:
          !!sessionStorage.getItem("sb-ztfmrfhznwqsfziafltr-auth-token") ||
          !!localStorage.getItem("sb-ztfmrfhznwqsfziafltr-auth-token"),
      };
    });

    console.log("=== STORAGE INFO ===", JSON.stringify(storageInfo, null, 2));
    console.log("=== ALL CONSOLE LOGS ===");
    consoleLogs.slice(0, 30).forEach((log) => console.log(log));
    console.log("=== ALL ERRORS ===");
    errors.forEach((error) => console.log(error));

    // Check if we can see any error messages in the UI
    const pageText = await page.evaluate(() => document.body.innerText);
    console.log("=== PAGE TEXT (first 500 chars) ===");
    console.log(pageText.substring(0, 500));
  });
});
