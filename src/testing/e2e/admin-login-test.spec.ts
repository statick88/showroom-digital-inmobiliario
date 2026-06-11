import { test, expect } from "@playwright/test";

const BASE = "https://statick88.github.io/showroom-digital-inmobiliario";
const ADMIN_EMAIL = "dsaavedra88@gmail.com";
const ADMIN_PASS = "a1b2c3d4*";
const SUPABASE_PROJECT_REF = "ktfmrfhznwqsfziafltr";

// These must be set via environment variables in CI
const ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;

const hasEnv = Boolean(ANON_KEY && SUPABASE_URL);

test.describe("Admin Login Test", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasEnv, "Missing VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_URL");

    // Get a fresh access token using the anon key from environment
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
    // This runs before any page scripts execute
    await page.addInitScript(([projectRef, session]) => {
      localStorage.setItem(`sb-${projectRef}-auth-token`, JSON.stringify(session));
    }, [SUPABASE_PROJECT_REF, sessionData]);
    
    console.log("Auth session init script added");
  });

  test("should load admin panel after auth", async ({ page }) => {
    await page.goto(`${BASE}/#admin`, { waitUntil: "networkidle", timeout: 20000 });
    
    // Wait for the Supabase client to load session from localStorage
    await page.waitForFunction(
      () => document.body.innerText.includes("Admin Panel"),
      { timeout: 30000, polling: 1000 }
    ).catch(() => {
      console.log("Admin Panel did not appear within timeout");
    });

    await page.waitForTimeout(3000);

    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log("=== BODY TEXT ===");
    console.log(bodyText.substring(0, 3000));
    
    const url = page.url();
    console.log("Current URL:", url);
    
    const adminPanelVisible = await page
      .getByText("Admin Panel")
      .isVisible()
      .catch(() => false);
    
    console.log("Admin Panel visible:", adminPanelVisible);
    
    if (!adminPanelVisible) {
      const bodyText = await page.evaluate(() => document.body.innerText);
      console.log("Body text:", bodyText.substring(0, 3000));
    }

    expect(adminPanelVisible).toBeTruthy();
  });
});