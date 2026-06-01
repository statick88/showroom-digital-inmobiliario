import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/testing/e2e",
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: "https://statick88.github.io/showroom-digital-inmobiliario",
    headless: true,
    launchOptions: {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
