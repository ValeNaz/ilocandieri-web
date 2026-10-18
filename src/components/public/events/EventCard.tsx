// INTERFACE CONTRACT (owner: EVENTS agent). Props must stay stable.
import Link from "next/link";
import { Badge, type BadgeTone } from "@/components/ui";
import { eventDayBadge, formatEventTime } from "@/lib/events/format";
import type { EventCardData } from "@/lib/events/public";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";

/** Stub colors (text color is the one verified for that field in contrast.test.ts). */
const STUBS = ["bg-cobalto text-paper", "bg-terracotta text-paper", "bg-olive-deep text-paper", "bg-limone text-ink"] as const;
const stubFor = (id: string) => STUBS[[...id].reduce((s, c) => s + c.charCodeAt(0), 0) % STUBS.length]!;

const labelTone = (label: string): BadgeTone =>
  label === "Iscrizioni aperte" ? "success" : label === "Posti esauriti" ? "warning" : label === "Iscrizioni a breve" ? "olive" : "neutral";

/** An event is a ticket: the date is the stub, the details are the body, a dashed line is the perforation. */
export function EventCard({ event, headingLevel = 3 }: { event: EventCardData; headingLevel?: 2 | 3 }) {
  const Heading = `h${headingLevel}` as "h2" | "h3";
  const { day, month } = eventDayBadge(event.startsAt);
  return (
    <article className={cn("group relative flex h-full overflow-hidden rounded-[1.4rem] border-[3px] border-ink bg-card text-ink transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-1.5 hover:shadow-[0.45rem_0.45rem_0_0_var(--color-ink)] focus-within:-translate-y-1.5 focus-within:shadow-[0.45rem_0.45rem_0_0_var(--color-ink)]", event.isPast && "bg-paper-deep")}>
      <div aria-hidden="true" className={cn("flex w-[5.5rem] shrink-0 flex-col items-center justify-center gap-1 border-r-[3px] border-dashed border-ink px-2 py-5 text-center sm:w-28", event.isPast ? "bg-kraft text-ink" : stubFor(event.id))}>
        <span className="font-display text-[2.8rem] font-extrabold leading-none tabular-nums sm:text-[3.4rem]">{day}</span>
        <span className="font-stencil text-sm font-bold uppercase tracking-[0.2em]">{month}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        {event.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- media is served by our own /media route
          <img src={event.coverUrl} alt={event.coverAlt} loading="lazy" decoding="async" className={cn("aspect-[16/7] w-full border-b-[3px] border-ink object-cover", event.isPast && "saturate-[.55]")} />
        )}
        <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            {event.isPast && <Badge>Concluso</Badge>}
            {event.categoryName && <Badge tone="terracotta">{event.categoryName}</Badge>}
            {event.registrationLabel && <Badge tone={labelTone(event.registrationLabel)}>{event.registrationLabel}</Badge>}
          </div>
          <Heading className="text-[1.4rem] font-extrabold leading-tight sm:text-[1.6rem]">
            <Link href={paths.event(event.slug)} className="rounded after:absolute after:inset-0 after:content-[''] focus-visible:outline-offset-[-4px]">
              {event.title}
            </Link>
          </Heading>
          {event.summary && <p className="line-clamp-3 text-[0.98rem] text-ink-soft">{event.summary}</p>}
          <p className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-sm font-medium">
            <span><span className="sr-only">Orario: </span>{formatEventTime(event.startsAt)}</span>
            {event.location && <span><span className="sr-only">Luogo: </span>{event.location}</span>}
          </p>
        </div>
      </div>
    </article>
  );
}
