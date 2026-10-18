import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT || 3100);
const adminEmail = process.env.ADMIN_EMAIL || "admin@example.test";
const adminPassword = process.env.ADMIN_PASSWORD || "e2e-Password-123!";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: { baseURL: `http://localhost:${port}`, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `rm -rf data/e2e.db* && pnpm db:migrate && pnpm db:seed && pnpm dev --port ${port}`,
    url: `http://localhost:${port}/admin/login`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_URL: "file:./data/e2e.db",
      NEXT_DIST_DIR: ".next-e2e",
      ADMIN_EMAIL: adminEmail,
      ADMIN_PASSWORD: adminPassword,
      APP_SECRET: "e2e-secret-e2e-secret-e2e-secret-0123",
      SITE_URL: `http://localhost:${port}`,
    },
  },
});
