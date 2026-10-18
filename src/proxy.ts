import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "il_session"; // keep in sync with src/lib/auth/session.ts
const PUBLIC_ADMIN = ["/admin/login", "/admin/password-dimenticata", "/admin/reimposta"];

/**
 * Optimistic gate: no session cookie -> redirect to login. The REAL check (DB session) happens in
 * `requireAdmin()` in the (panel) layout and in every server action / route handler.
 */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isPublicAdmin = PUBLIC_ADMIN.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isPublicAdmin && !req.cookies.get(SESSION_COOKIE)?.value) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
    const res = NextResponse.redirect(url);
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
