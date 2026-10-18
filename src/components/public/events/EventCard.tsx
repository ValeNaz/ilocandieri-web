// INTERFACE CONTRACT (owner: EVENTS agent). Props must stay stable; implementation will be replaced.
import type { EventCardData } from "@/lib/events/public";

export function EventCard(_props: { event: EventCardData; headingLevel?: 2 | 3 }) {
  return null;
}
