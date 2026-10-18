import { sql } from "drizzle-orm";
import { db as defaultDb, type Db } from "@/lib/db";

export type RateLimitResult = { ok: boolean; count: number; remaining: number; retryAfterMs: number };

/**
 * Fixed-window rate limiter stored in the `rate_limits` table. Single atomic upsert,
 * safe under concurrency. `key` should already namespace the action, e.g. `login:${ipHash}`.
 */
export async function rateLimit(opts: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
  db?: Db;
}): Promise<RateLimitResult> {
  const { key, limit, windowMs } = opts;
  const now = opts.now ?? Date.now();
  const d = opts.db ?? defaultDb;
  const rows = await d.all<{ count: number; window_start: number }>(sql`
    INSERT INTO rate_limits (key, count, window_start) VALUES (${key}, 1, ${now})
    ON CONFLICT(key) DO UPDATE SET
      count = CASE WHEN window_start + ${windowMs} <= ${now} THEN 1 ELSE count + 1 END,
      window_start = CASE WHEN window_start + ${windowMs} <= ${now} THEN ${now} ELSE window_start END
    RETURNING count, window_start`);
  const row = rows[0]!;
  const count = Number(row.count);
  const windowStart = Number(row.window_start);
  return {
    ok: count <= limit,
    count,
    remaining: Math.max(0, limit - count),
    retryAfterMs: Math.max(0, windowStart + windowMs - now),
  };
}

/** Reset a key (e.g. after successful login). */
export async function resetRateLimit(key: string, d: Db = defaultDb) {
  await d.run(sql`DELETE FROM rate_limits WHERE key = ${key}`);
}

/** Housekeeping: delete expired windows. Call occasionally. */
export async function purgeRateLimits(olderThanMs = 24 * 3600_000, d: Db = defaultDb) {
  await d.run(sql`DELETE FROM rate_limits WHERE window_start < ${Date.now() - olderThanMs}`);
}
