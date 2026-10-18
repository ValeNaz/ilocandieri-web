// INTERFACE CONTRACT (owner: EVENTS agent). Signature must stay stable; implementation will be replaced.
export type EventCardData = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  startsAt: number;
  endsAt: number | null;
  location: string | null;
  coverUrl: string | null;
  coverAlt: string;
  categoryName: string | null;
  isPast: boolean;
  registrationLabel: string | null; // e.g. "Iscrizioni aperte", "Posti esauriti"
};

/** Published upcoming events for Home: featured first, then by date. */
export async function getHomeEvents(_limit: number): Promise<EventCardData[]> {
  return [];
}
