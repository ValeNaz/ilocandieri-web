import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { mkdirSync } from "node:fs";
import path from "node:path";
import * as schema from "./schema";

export type Db = LibSQLDatabase<typeof schema>;

const DEFAULT_URL = "file:./data/app.db";

function ensureDir(url: string) {
  if (!url.startsWith("file:") || url === "file::memory:") return;
  const file = url.slice("file:".length);
  mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
}

/** Create a standalone client + drizzle instance (used by scripts/tests). */
export function createDb(url = process.env.DATABASE_URL || DEFAULT_URL, authToken = process.env.DATABASE_AUTH_TOKEN) {
  ensureDir(url);
  const client = createClient({ url, authToken: authToken || undefined });
  return { client, db: drizzle(client, { schema }) as Db };
}

type Cache = { client: Client; db: Db };
const g = globalThis as unknown as { __ilDb?: Cache };

function get(): Cache {
  if (!g.__ilDb) {
    g.__ilDb = createDb();
    // Pragmas are per-connection; best effort (ignored by remote libSQL).
    void g.__ilDb.client.execute("PRAGMA foreign_keys = ON").catch(() => {});
    void g.__ilDb.client.execute("PRAGMA busy_timeout = 5000").catch(() => {});
  }
  return g.__ilDb;
}

/** Shared Drizzle instance. Lazy so importing it never touches the DB at build time. */
export const db: Db = new Proxy({} as Db, {
  get(_t, prop) {
    const d = get().db as unknown as Record<string | symbol, unknown>;
    const v = d[prop];
    return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(d) : v;
  },
});

export { schema };
export { newId } from "./id";
