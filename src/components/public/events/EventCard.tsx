// INTERFACE CONTRACT (owner: EVENTS agent). Props must stay stable.
import Link from "next/link";
import { Badge, type BadgeTone } from "@/components/ui";
import { eventDayBadge, formatEventTime } from "@/lib/events/format";
import type { EventCardData } from "@/lib/events/public";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";

const labelTone = (label: string): BadgeTone =>
  label === "Iscrizioni aperte" ? "success" : label === "Posti esauriti" ? "warning" : label === "Iscrizioni a breve" ? "olive" : "neutral";

/** Event card: the date on the left, details on the right. */
export function EventCard({ event, headingLevel = 3 }: { event: EventCardData; headingLevel?: 2 | 3 }) {
  const Heading = `h${headingLevel}` as "h2" | "h3";
  const { day, month } = eventDayBadge(event.startsAt);
  return (
    <article className={cn("group relative flex h-full overflow-hidden rounded-card border border-line bg-card text-ink transition-shadow duration-300 ease-out-expo hover:shadow-pop focus-within:shadow-pop", event.isPast && "bg-paper-deep")}>
      <div aria-hidden="true" className={cn("flex w-20 shrink-0 flex-col items-center justify-start gap-1 border-r border-line px-2 pt-6 text-center sm:w-24", event.isPast ? "text-ink-soft" : "text-terracotta-deep")}>
        <span className="text-[2.2rem] font-semibold leading-none tabular-nums sm:text-[2.6rem]">{day}</span>
        <span className="text-xs font-semibold uppercase tracking-[0.1em]">{month}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        {event.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- media is served by our own /media route
          <img src={event.coverUrl} alt={event.coverAlt} loading="lazy" decoding="async" className={cn("aspect-[16/7] w-full object-cover", event.isPast && "saturate-[.55]")} />
        )}
        <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            {event.isPast && <Badge>Concluso</Badge>}
            {event.categoryName && <Badge tone="terracotta">{event.categoryName}</Badge>}
            {event.registrationLabel && <Badge tone={labelTone(event.registrationLabel)}>{event.registrationLabel}</Badge>}
          </div>
          <Heading className="text-[1.25rem] font-semibold leading-snug sm:text-[1.35rem]">
            <Link href={paths.event(event.slug)} className="rounded after:absolute after:inset-0 after:content-[''] focus-visible:outline-offset-[-4px]">
              {event.title}
            </Link>
          </Heading>
          {event.summary && <p className="line-clamp-3 text-[0.98rem] text-ink-soft">{event.summary}</p>}
          <p className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-sm text-ink-soft">
            <span><span className="sr-only">Orario: </span>{formatEventTime(event.startsAt)}</span>
            {event.location && <span><span className="sr-only">Luogo: </span>{event.location}</span>}
          </p>
        </div>
      </div>
    </article>
  );
}
