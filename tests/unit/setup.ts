// Runs before every unit test file: isolated temp SQLite DB with all migrations applied.
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll } from "vitest";

const dir = mkdtempSync(path.join(tmpdir(), "il-test-"));
process.env.DATABASE_URL = `file:${path.join(dir, "test.db")}`;
process.env.APP_SECRET = "unit-test-secret-unit-test-secret";
process.env.STORAGE_DIR = path.join(dir, "storage");
delete process.env.SMTP_HOST;

beforeAll(async () => {
  const { migrate } = await import("drizzle-orm/libsql/migrator");
  const { db } = await import("@/lib/db");
  await migrate(db, { migrationsFolder: "./drizzle" });
});
