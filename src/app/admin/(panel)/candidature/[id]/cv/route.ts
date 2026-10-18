import { NextResponse } from "next/server";
import { requireAdminRoute } from "@/lib/auth/session";
import { getApplication } from "@/lib/careers/admin";
import { getStorage, safeDisplayName } from "@/lib/storage";

export const dynamic = "force-dynamic";

const EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};
const noStore = { "Cache-Control": "no-store, private" };

/** Authenticated CV download. The private storage is never served any other way. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRoute();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const app = await getApplication(id);
  if (!app || !app.cvPath || !app.cvMime || !EXT[app.cvMime]) {
    return NextResponse.json({ error: "File non trovato" }, { status: 404, headers: noStore });
  }
  const data = await getStorage().get("private", app.cvPath);
  if (!data) return NextResponse.json({ error: "File non trovato" }, { status: 404, headers: noStore });

  const ext = EXT[app.cvMime]!;
  const base = safeDisplayName(app.cvName ?? "curriculum").replace(/\.[A-Za-z0-9]{1,5}$/, "");
  const full = `${base || "curriculum"}.${ext}`;
  const ascii = full.replace(/[^\x20-\x7e]/g, "_").replace(/["\;]/g, "_");
  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": app.cvMime,
      "Content-Length": String(data.length),
      "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(full)}`,
      "X-Content-Type-Options": "nosniff",
      ...noStore,
    },
  });
}
