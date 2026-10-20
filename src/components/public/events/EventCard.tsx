// INTERFACE CONTRACT (owner: EVENTS agent). Props must stay stable (`featured` is an optional addition).
import Link from "next/link";
import { eventDayBadge, formatEventDateShort, formatEventTime } from "@/lib/events/format";
import type { EventCardData } from "@/lib/events/public";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";
import "../liste/liste.css";

const weekday = new Intl.DateTimeFormat("it-IT", { weekday: "short", timeZone: "Europe/Rome" });

type TicketState = "open" | "full" | "closed" | "soon" | "past" | "none";
const stateOf = (e: Pick<EventCardData, "isPast" | "registrationLabel">): TicketState =>
  e.isPast ? "past" : e.registrationLabel === "Iscrizioni aperte" ? "open" : e.registrationLabel === "Posti esauriti" ? "full" : e.registrationLabel === "Iscrizioni terminate" ? "closed" : e.registrationLabel === "Iscrizioni a breve" ? "soon" : "none";
const BADGE: Record<TicketState, string> = { open: "bd bd-green", full: "bd bd-orange", closed: "bd", soon: "bd bd-yellow", past: "bd bd-line", none: "bd" };

/**
 * An event as a cut-out ticket: the date as a huge stub on the left (colour = state of the registrations), a dashed tear line,
 * the details on the right. The whole ticket is one link (the title's `::after`).
 */
export function EventCard({ event, headingLevel = 3, featured = false }: { event: EventCardData; headingLevel?: 2 | 3; featured?: boolean }) {
  const Heading = `h${headingLevel}` as "h2" | "h3";
  const { day, month } = eventDayBadge(event.startsAt);
  const state = stateOf(event);
  return (
    <article className={cn("tk", featured && "tk-lg")} data-state={state}>
      <div className="tk-in">
        <div aria-hidden="true" className="tk-stub">
          <span className="tk-wd">{weekday.format(event.startsAt).replace(".", "")}</span>
          <span className="tk-day">{day}</span>
          <span className="tk-mo">{month}</span>
        </div>
        <div className="tk-body">
          {event.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- media is served by our own /media route
            <img src={event.coverUrl} alt={event.coverAlt} loading="lazy" decoding="async" className="tk-cover" />
          )}
          <div className="tk-text">
            <div className="tk-badges">
              {event.isPast && <span className={BADGE.past}>Concluso</span>}
              {event.registrationLabel && <span className={BADGE[state]}>{event.registrationLabel}</span>}
              {event.categoryName && <span className="bd">{event.categoryName}</span>}
            </div>
            <Heading className="tk-title">
              <Link href={paths.event(event.slug)}>{event.title}</Link>
            </Heading>
            {event.summary && <p className="tk-sum">{event.summary}</p>}
            <p className="tk-meta">
              <span className="sr-only">Data: {formatEventDateShort(event.startsAt)}. </span>
              <span><span className="sr-only">Orario: </span><time dateTime={new Date(event.startsAt).toISOString()}>Ore {formatEventTime(event.startsAt)}</time></span>
              {event.location && <span><span className="sr-only">Luogo: </span>{event.location}</span>}
            </p>
          </div>
        </div>
      </div>
      <i aria-hidden="true" className="tk-n tk-n1" />
      <i aria-hidden="true" className="tk-n tk-n2" />
    </article>
  );
}
