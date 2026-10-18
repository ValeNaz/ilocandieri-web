import { db as defaultDb, type Db } from "@/lib/db";

export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/** Throw inside a transaction to roll it back and make runTx() resolve with `result`. */
export class TxAbort<R> extends Error {
  constructor(public readonly result: R) {
    super("tx-abort");
  }
}

const isBusy = (e: unknown) => /SQLITE_BUSY|SQLITE_LOCKED|TRANSACTION_ACTIVE|database is locked|database table is locked/i.test(String((e as Error)?.message ?? e)) || /SQLITE_BUSY|SQLITE_LOCKED/.test(String((e as { code?: string })?.code ?? ""));

/**
 * In-process writer queue. SQLite has a single writer anyway; queueing here avoids exhausting the libSQL
 * connection pool (default 20) when many requests arrive together. Cross-process safety does NOT depend on
 * it: it comes from BEGIN IMMEDIATE + the conditional UPDATEs (see registrations.ts).
 */
const tails = new WeakMap<object, Promise<unknown>>();
function exclusive<T>(key: object, fn: () => Promise<T>): Promise<T> {
  const tail = tails.get(key) ?? Promise.resolve();
  const run = tail.then(fn, fn);
  tails.set(key, run.catch(() => undefined));
  return run;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Write transaction (BEGIN IMMEDIATE via libSQL "write" mode) with retry on lock contention.
 * Concurrent writers (other requests / processes) wait their turn instead of failing.
 */
export function runTx<T>(fn: (tx: Tx) => Promise<T>, d: Db = defaultDb): Promise<T> {
  return exclusive(d, () => runTxUnqueued(fn, d));
}

async function runTxUnqueued<T>(fn: (tx: Tx) => Promise<T>, d: Db): Promise<T> {
  const attempts = 12;
  for (let i = 0; ; i++) {
    try {
      return await d.transaction(fn);
    } catch (e) {
      if (e instanceof TxAbort) return e.result as T;
      // libSQL wraps errors: look at the cause chain too.
      let cur: unknown = e;
      let busy = false;
      for (let depth = 0; cur && depth < 4; depth++) {
        if (isBusy(cur)) busy = true;
        cur = (cur as { cause?: unknown }).cause;
      }
      if (!busy || i >= attempts - 1) throw e;
      await sleep(Math.min(400, 8 * 2 ** i) * (0.5 + Math.random()));
    }
  }
}

export const isUniqueViolation = (e: unknown, column?: string) => {
  let cur: unknown = e;
  for (let depth = 0; cur && depth < 4; depth++) {
    const msg = String((cur as Error).message ?? "");
    if (/UNIQUE constraint failed/i.test(msg) && (!column || msg.includes(column))) return true;
    cur = (cur as { cause?: unknown }).cause;
  }
  return false;
};
