import { NextResponse } from "next/server";
import { requireAdminRoute } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { registrationsCsv } from "@/lib/events/admin";
import { REGISTRATION_STATUSES } from "@/lib/events/admin";

export const dynamic = "force-dynamic";

/** CSV export of registrations (admin only). Filters: ?evento=<id>&stato=<status>&q=<text>. Contains personal data: never cached. */
export async function GET(req: Request) {
  const auth = await requireAdminRoute();
  if (auth instanceof NextResponse) return auth;
  const url = new URL(req.url);
  const evento = url.searchParams.get("evento");
  const stato = url.searchParams.get("stato");
  const csv = await registrationsCsv({
    eventId: evento && /^[a-z0-9]{10,40}$/.test(evento) ? evento : null,
    status: (REGISTRATION_STATUSES as readonly string[]).includes(stato ?? "") ? (stato as (typeof REGISTRATION_STATUSES)[number]) : null,
    q: (url.searchParams.get("q") ?? "").slice(0, 100) || null,
  });
  await audit(auth.id, "registrations_exported", "registration");
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="iscrizioni-${stamp}.csv"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
