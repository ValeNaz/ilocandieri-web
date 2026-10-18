import "dotenv/config";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createDb } from "../src/lib/db";

const { client, db } = createDb();
await migrate(db, { migrationsFolder: "./drizzle" });
await client.execute("PRAGMA journal_mode = WAL").catch(() => {});
console.log("Migrations applied.");
client.close();
