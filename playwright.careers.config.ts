import { defineConfig, devices } from "@playwright/test";

// Isolated e2e run for the CAREERS module (own port, DB, storage and Next dist dir): safe next to other agents' runs.
const port = Number(process.env.CAREERS_E2E_PORT || 3205);
const adminEmail = "admin@example.test";
const adminPassword = "e2e-Password-123!";

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: /careers\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: { baseURL: `http://localhost:${port}`, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `rm -rf data/careers-e2e.db* storage-careers-e2e && pnpm db:migrate && pnpm db:seed && pnpm dev --port ${port}`,
    url: `http://localhost:${port}/admin/login`,
    reuseExistingServer: false,
    stdout: "pipe",
    timeout: 180_000,
    env: {
      DATABASE_URL: "file:./data/careers-e2e.db",
      NEXT_DIST_DIR: ".next-careers-e2e",
      STORAGE_DIR: "./storage-careers-e2e",
      ADMIN_EMAIL: adminEmail,
      ADMIN_PASSWORD: adminPassword,
      APP_SECRET: "e2e-secret-e2e-secret-e2e-secret-0123",
      SITE_URL: `http://localhost:${port}`,
      SMTP_HOST: "",
    },
  },
});
