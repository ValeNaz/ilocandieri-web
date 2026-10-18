// INTERFACE CONTRACT (owner: EVENTS agent). Props must stay stable.
import Link from "next/link";
import { Badge, Pattern, type BadgeTone } from "@/components/ui";
import { eventDayBadge, formatEventTime } from "@/lib/events/format";
import type { EventCardData } from "@/lib/events/public";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";

const PATTERNS = ["agrumi", "maiolica", "campi"] as const;
const patternFor = (id: string) => PATTERNS[[...id].reduce((s, c) => s + c.charCodeAt(0), 0) % PATTERNS.length]!;

const labelTone = (label: string): BadgeTone =>
  label === "Iscrizioni aperte" ? "success" : label === "Posti esauriti" ? "warning" : label === "Iscrizioni a breve" ? "olive" : "neutral";

export function EventCard({ event, headingLevel = 3 }: { event: EventCardData; headingLevel?: 2 | 3 }) {
  const Heading = `h${headingLevel}` as "h2" | "h3";
  const { day, month } = eventDayBadge(event.startsAt);
  return (
    <article className={cn("group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-card shadow-card transition-[transform,box-shadow] duration-300 ease-out-soft hover:-translate-y-1 hover:shadow-pop focus-within:-translate-y-1 focus-within:shadow-pop", event.isPast && "bg-card/80")}>
      <div className="relative aspect-[16/9] overflow-hidden bg-paper-deep sm:aspect-[16/10]">
        {event.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- media is served by our own /media route
          <img src={event.coverUrl} alt={event.coverAlt} loading="lazy" decoding="async" className={cn("size-full object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]", event.isPast && "saturate-[.6]")} />
        ) : (
          <Pattern variant={patternFor(event.id)} className="size-full" />
        )}
        <div className="absolute left-4 top-4 flex min-w-14 flex-col items-center rounded-2xl bg-card px-3 py-2 text-center leading-none shadow-card" aria-hidden="true">
          <span className="font-display text-2xl font-semibold text-ink">{day}</span>
          <span className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-terracotta-deep">{month}</span>
        </div>
        {event.isPast && <Badge className="absolute right-4 top-4 bg-card">Concluso</Badge>}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex flex-wrap items-center gap-2">
          {event.categoryName && <Badge tone="terracotta">{event.categoryName}</Badge>}
          {event.registrationLabel && <Badge tone={labelTone(event.registrationLabel)}>{event.registrationLabel}</Badge>}
        </div>
        <Heading className="text-[1.45rem] font-medium leading-tight">
          <Link href={paths.event(event.slug)} className="rounded after:absolute after:inset-0 after:content-[''] focus-visible:outline-offset-[-4px]">
            {event.title}
          </Link>
        </Heading>
        {event.summary && <p className="line-clamp-3 text-[0.97rem] text-ink-soft">{event.summary}</p>}
        <p className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-sm text-ink-soft">
          <span><span className="sr-only">Orario: </span>{formatEventTime(event.startsAt)}</span>
          {event.location && <span><span className="sr-only">Luogo: </span>{event.location}</span>}
        </p>
      </div>
    </article>
  );
}
