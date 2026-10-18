import type { Db } from "../src/lib/db";
import type * as schemaNs from "../src/lib/db/schema";

export type SeedContext = {
  db: Db;
  schema: typeof schemaNs;
  newId: () => string;
  /** Log helper: `log("products: 6 inserted")`. */
  log: (msg: string) => void;
};

/** Every file in scripts/seed/*.ts (not starting with "_") must `export default` one of these. Must be idempotent. */
export type SeedFn = (ctx: SeedContext) => Promise<void>;
