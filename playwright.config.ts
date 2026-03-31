import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  webServer: {
    command: "pnpm dev --port 5174",
    url: "http://localhost:5174",
    reuseExistingServer: false,
  },
  expect: {
    timeout: 5000,
  },
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://localhost:5174",
    actionTimeout: 5000,
    channel: "chromium",
  },
  forbidOnly: !!process.env.CI,
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/report.json" }],
    ...(process.env.CI ? [["github"] as const] : []),
  ],
});
