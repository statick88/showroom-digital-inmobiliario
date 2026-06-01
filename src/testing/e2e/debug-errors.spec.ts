import { test, expect } from "@playwright/test";

const BASE = "https://statick88.github.io/showroom-digital-inmobiliario";

test("debug SPA rendering", async ({ page }) => {
  const errors: string[] = [];
  const consoleMsgs: string[] = [];

  page.on("console", (msg) => {
    consoleMsgs.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on("pageerror", (err) => {
    errors.push(err.message);
  });
  page.on("crash", () => errors.push("PAGE CRASHED"));

  await page.goto(BASE, { waitUntil: "load", timeout: 20000 });
  await page.waitForTimeout(5000);

  const info = await page.evaluate(() => {
    const root = document.getElementById("root");
    return {
      rootChildren: root?.children?.length ?? 0,
      rootHtmlLen: root?.innerHTML?.length ?? 0,
      scriptCount: document.querySelectorAll("script").length,
      moduleScripts: Array.from(document.querySelectorAll("script[type=module]")).map((s) => ({
        src: s.src,
        crossOrigin: s.crossOrigin,
      })),
    };
  });

  console.log("=== INFO ===", JSON.stringify(info, null, 2));
  console.log("=== CONSOLE (first 20) ===");
  consoleMsgs.slice(0, 20).forEach((m) => console.log(m));
  console.log("=== ERRORS ===");
  errors.forEach((e) => console.log(e));
  console.log("=== TOTAL CONSOLE:", consoleMsgs.length, "ERRORS:", errors.length);
});
