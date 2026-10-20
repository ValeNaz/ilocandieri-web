import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { PillLink } from "@/components/public/abes/PillLink";
import { Room, Wrap } from "@/components/public/kit/Room";
import { eventDayBadge, formatEventTime } from "@/lib/events/format";
import type { EventCardData } from "@/lib/events/public";
import type { Cta } from "@/lib/content/blocks";
import { paths } from "@/lib/paths";
import "./dynamic.css";

const TONES = ["", "etk-g", "etk-o"] as const;

/** Upcoming events as cut-out tickets: huge date on the stub, perforation, details. Honest empty state when there are none. */
export function EventTickets({ events, eyebrow, title, text, cta, emptyMessage, level = 2, id }: { id?: string; events: EventCardData[]; eyebrow?: string; title: string; text?: string; cta?: Cta | null; emptyMessage?: string; level?: 1 | 2 }) {
  const H = level === 1 ? "h1" : "h2";
  const n = Math.min(events.length, 3);
  return (
    <Room tone="yellow" id={id} className="py-16 sm:py-28">
      <Wrap>
        <div className="grid items-end gap-6 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-8">
            {eyebrow && <p className="t-label mb-4">{eyebrow}</p>}
            <H className="t-giant">{title}</H>
          </div>
          {text && <p className="t-body lg:col-span-4">{text}</p>}
        </div>
        {events.length > 0 ? (
          <ul className={`etk-list etk-${n} mt-16`}>
            {events.map((e, i) => {
              const { day, month } = eventDayBadge(e.startsAt);
              return (
                <li key={e.id}>
                  <article className={`etk ${TONES[i % 3]}`}>
                    <div className="etk-stub" aria-hidden="true"><span className="etk-day">{day}</span><span className="etk-mon">{month}</span></div>
                    <div className="etk-body">
                      {e.categoryName && <p className="t-label">{e.categoryName}</p>}
                      <h3 className="etk-title"><Link href={paths.event(e.slug)}>{e.title}</Link></h3>
                      <p className="etk-meta"><span><span className="sr-only">Data: </span><time dateTime={new Date(e.startsAt).toISOString()}>{`${day} ${month}, ${formatEventTime(e.startsAt)}`}</time></span>{e.location && <span><span className="sr-only">Luogo: </span>{e.location}</span>}</p>
                      {e.registrationLabel && <p className="etk-tag">{e.registrationLabel}</p>}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : emptyMessage ? (
          <div className="etk-empty mt-12">
            <LogoMark className="h-14 w-auto" />
            <p className="t-head">{emptyMessage}</p>
          </div>
        ) : null}
        {cta && <div className="mt-10"><PillLink href={cta.href}>{cta.label}</PillLink></div>}
      </Wrap>
    </Room>
  );
}
