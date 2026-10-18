import { NextResponse } from "next/server";
import { getAvailability, getPublicEvent } from "@/lib/events/public";
import { stateMessage } from "@/lib/events/messages";
import { getEventTexts } from "@/lib/events/texts";

export const dynamic = "force-dynamic";

/** Public, read-only: live registration state + remaining seats (limited events only). */
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const [a, p, texts] = await Promise.all([getAvailability(slug), getPublicEvent(slug), getEventTexts()]);
  if (!a || !p) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ state: a.state, remaining: a.remaining, message: stateMessage(p.event, a.state, texts.messages) }, { headers: { "Cache-Control": "no-store" } });
}
