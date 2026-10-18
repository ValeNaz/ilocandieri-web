import { describe, expect, it } from "vitest";
import { FORM_TOKEN_FIELD, HONEYPOT_FIELD, checkBot, hashIp, honeypotPassed, issueFormToken, rateLimit, sanitizeHtml, stripHtml, verifyFormToken } from "@/lib/security";

describe("rateLimit", () => {
  it("allows up to the limit then blocks, and resets after the window", async () => {
    const key = `t:${Math.random()}`;
    const t0 = 1_000_000;
    const r1 = await rateLimit({ key, limit: 2, windowMs: 1000, now: t0 });
    const r2 = await rateLimit({ key, limit: 2, windowMs: 1000, now: t0 + 10 });
    const r3 = await rateLimit({ key, limit: 2, windowMs: 1000, now: t0 + 20 });
    expect([r1.ok, r2.ok, r3.ok]).toEqual([true, true, false]);
    expect(r3.retryAfterMs).toBeGreaterThan(0);
    const r4 = await rateLimit({ key, limit: 2, windowMs: 1000, now: t0 + 1500 });
    expect(r4.ok).toBe(true);
    expect(r4.count).toBe(1);
  });

  it("is safe under concurrency", async () => {
    const key = `c:${Math.random()}`;
    const res = await Promise.all(Array.from({ length: 10 }, () => rateLimit({ key, limit: 4, windowMs: 60_000 })));
    expect(res.filter((r) => r.ok)).toHaveLength(4);
  });
});

describe("form token + honeypot", () => {
  it("rejects missing, forged, too-fast and expired tokens; accepts valid", () => {
    const now = 1_700_000_000_000;
    const tok = issueFormToken(now);
    expect(verifyFormToken(undefined).ok).toBe(false);
    expect(verifyFormToken("123.abc")).toMatchObject({ ok: false, reason: "invalid" });
    expect(verifyFormToken(tok, { now: now + 500 })).toMatchObject({ ok: false, reason: "too_fast" });
    expect(verifyFormToken(tok, { now: now + 5000 })).toEqual({ ok: true });
    expect(verifyFormToken(tok, { now: now + 3 * 3600_000 })).toMatchObject({ ok: false, reason: "expired" });
    const forged = `${now - 100000}.${tok.split(".")[1]}`;
    expect(verifyFormToken(forged, { now: now + 5000 })).toMatchObject({ ok: false, reason: "invalid" });
  });

  it("scopes tokens", () => {
    const now = 1_700_000_000_000;
    const tok = issueFormToken(now, "contact");
    expect(verifyFormToken(tok, { now: now + 5000, scope: "careers" }).ok).toBe(false);
    expect(verifyFormToken(tok, { now: now + 5000, scope: "contact" }).ok).toBe(true);
  });

  it("checkBot combines honeypot and token", () => {
    const now = Date.now();
    const fd = new FormData();
    fd.set(FORM_TOKEN_FIELD, issueFormToken(now - 10_000));
    expect(checkBot(fd)).toEqual({ ok: true });
    fd.set(HONEYPOT_FIELD, "http://spam");
    expect(honeypotPassed(fd)).toBe(false);
    expect(checkBot(fd)).toMatchObject({ ok: false, reason: "honeypot" });
  });
});

describe("hashIp", () => {
  it("is deterministic, keyed and does not contain the ip", () => {
    const a = hashIp("1.2.3.4");
    expect(a).toBe(hashIp("1.2.3.4"));
    expect(a).not.toBe(hashIp("1.2.3.5"));
    expect(a).toHaveLength(32);
    expect(a).not.toContain("1.2.3.4");
  });
});

describe("sanitizeHtml", () => {
  it("removes scripts, handlers, javascript: urls", () => {
    const out = sanitizeHtml(`<p onclick="x()">ciao<script>alert(1)</script></p><a href="javascript:alert(1)">x</a><img src="x" onerror="a()">`);
    expect(out).not.toMatch(/script|onclick|onerror|javascript:/i);
    expect(out).toContain("<p>ciao</p>");
  });
  it("keeps allowed formatting and hardens links", () => {
    const out = sanitizeHtml(`<h2>T</h2><a href="https://a.it">l</a><img src="/media/2026/10/a.jpg" alt="foto"><img src="http://evil/x.png"><iframe src="https://x"></iframe>`);
    expect(out).toContain('rel="noopener noreferrer"');
    expect(out).toContain('src="/media/2026/10/a.jpg"');
    expect(out).not.toContain("evil");
    expect(out).not.toContain("iframe");
  });
  it("stripHtml returns plain text", () => {
    expect(stripHtml("<p>Ciao <b>mondo</b></p>")).toBe("Ciao mondo");
  });
});
