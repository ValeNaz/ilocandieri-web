/**
 * Retention job: deletes applications (row + private CV file) older than settings.retention.applicationsDays
 * and registrations of events ended more than settings.retention.pastRegistrationsDays days ago.
 * A value of 0/empty means "not set": that category is NOT touched.
 *
 *   pnpm tsx scripts/retention.ts --dry-run   # only counts
 *   pnpm tsx scripts/retention.ts             # deletes
 *
 * Cron example (every night at 03:30), see docs/CAREERS.md:
 *   30 3 * * * cd /srv/ilocandieri-web && pnpm tsx scripts/retention.ts >> logs/retention.log 2>&1
 */
import "dotenv/config";
import { runRetention } from "../src/lib/careers/admin";
import { getSetting } from "../src/lib/settings";

const dryRun = process.argv.includes("--dry-run");
const retention = await getSetting("retention");
const rep = await runRetention(retention, { dryRun });
const fmt = (n: number | null) => (n === null ? "non impostato, nessuna azione" : String(n));
console.log(`[retention] ${dryRun ? "DRY RUN - " : ""}candidature ${dryRun ? "da eliminare" : "eliminate"}: ${fmt(rep.applications)}; iscrizioni eventi passati: ${fmt(rep.registrations)}`);
process.exit(0);
