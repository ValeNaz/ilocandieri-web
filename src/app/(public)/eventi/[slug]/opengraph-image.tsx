import { eventDayBadge, formatEventTime } from "@/lib/events/format";
import { getPublicEvent } from "@/lib/events/public";
import { OG_SIZE, OG_TYPE, ogImage } from "@/lib/og-image";

export const alt = "Evento de I Locandieri";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getPublicEvent((await params).slug);
  if (!p) return ogImage({ title: "Eventi", kicker: "Partecipa" });
  const { day, month } = eventDayBadge(p.event.startsAt);
  return ogImage({ title: p.event.title, kicker: `Evento · ${day} ${month} · ${formatEventTime(p.event.startsAt)}` });
}
