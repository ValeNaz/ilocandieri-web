import { defineConfig, devices } from "@playwright/test";

// Single e2e config for ALL specs in tests/e2e. One dev server on one port with an isolated
// DB, Next dist dir and storage dir (E2E_NAME / E2E_PORT let parallel runs avoid collisions).
// The DB is recreated (migrate + seed) at every run.
const name = process.env.E2E_NAME || "e2e";
const port = Number(process.env.E2E_PORT || 3100);

export const e2e = {
  adminEmail: "admin@example.test",
  adminPassword: "e2e-Password-123!",
  dbFile: `./data/${name}.db`,
};

export default defineConfig({
  testDir: "tests/e2e",
  outputDir: `test-results/${name}`,
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 }, // dev server compiles routes lazily
  reporter: "list",
  use: { baseURL: `http://localhost:${port}`, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `rm -rf data/${name}.db* data/${name}-storage && pnpm db:migrate && pnpm db:seed && pnpm dev --port ${port}`,
    url: `http://localhost:${port}/admin/login`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      DATABASE_URL: `file:${e2e.dbFile}`,
      NEXT_DIST_DIR: `.next-${name}`,
      STORAGE_DIR: `./data/${name}-storage`,
      ADMIN_EMAIL: e2e.adminEmail,
      ADMIN_PASSWORD: e2e.adminPassword,
      APP_SECRET: "e2e-secret-e2e-secret-e2e-secret-0123",
      SITE_URL: `http://localhost:${port}`,
      SMTP_HOST: "",
    },
  },
});
