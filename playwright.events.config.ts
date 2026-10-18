// Local helper for the EVENTS module: runs tests/e2e/events.spec.ts against an ALREADY RUNNING dev server
// (NEXT_DIST_DIR=.next-events DATABASE_URL=file:./data/events.db pnpm dev --port 3202). Not used by CI.
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: /events\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: { baseURL: process.env.E2E_BASE_URL || "http://localhost:3202", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
