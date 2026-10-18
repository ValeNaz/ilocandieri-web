import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { scopeDir } from "@/lib/storage/local";
import { resolveInside, UnsafePathError } from "@/lib/storage/safePath";

export const dynamic = "force-dynamic";

// Only these types are ever served, derived from the extension we wrote ourselves.
const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await ctx.params;
  try {
    const rel = segments.map((s) => decodeURIComponent(s)).join("/");
    const ext = rel.split(".").pop()?.toLowerCase() ?? "";
    const mime = MIME[ext];
    if (!mime) return new NextResponse("Not found", { status: 404 });
    // Only the public scope is ever reachable from here.
    const full = resolveInside(scopeDir("public"), rel);
    const st = await stat(full);
    if (!st.isFile()) return new NextResponse("Not found", { status: 404 });
    return new NextResponse(Readable.toWeb(createReadStream(full)) as ReadableStream, {
      headers: {
        "Content-Type": mime,
        "Content-Length": String(st.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
      },
    });
  } catch (e) {
    if (e instanceof UnsafePathError || e instanceof URIError) return new NextResponse("Not found", { status: 404 });
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return new NextResponse("Not found", { status: 404 });
    throw e;
  }
}
