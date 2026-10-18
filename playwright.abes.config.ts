// Dedicated e2e config for the ABES+NEWS module (own port, DB, dist dir and storage so parallel agents never collide).
// Run: pnpm exec playwright test -c playwright.abes.config.ts
import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT || 3204);
export const adminEmail = "admin@abes-e2e.test";
export const adminPassword = "e2e-Password-123!";

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: /abes-news\.spec\.ts/,
  outputDir: "test-results-abes",
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: { baseURL: `http://localhost:${port}`, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `rm -rf data/abes-e2e.db* data/abes-e2e-storage && pnpm db:migrate && pnpm db:seed && pnpm dev --port ${port}`,
    url: `http://localhost:${port}/admin/login`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      DATABASE_URL: "file:./data/abes-e2e.db",
      NEXT_DIST_DIR: ".next-abes-e2e",
      STORAGE_DIR: "./data/abes-e2e-storage",
      ADMIN_EMAIL: adminEmail,
      ADMIN_PASSWORD: adminPassword,
      APP_SECRET: "abes-e2e-secret-abes-e2e-secret-01234",
      SITE_URL: `http://localhost:${port}`,
    },
  },
});
