import type { schema } from "@/lib/db";

export type EventRow = typeof schema.events.$inferSelect;
export type RegistrationRow = typeof schema.registrations.$inferSelect;
export type RegistrationMode = NonNullable<EventRow["registrationMode"]>;
export type CtaType = EventRow["ctaType"];

/** Computed state of the registration for an event (never stored). */
export type RegistrationState = "not_applicable" | "not_yet_open" | "open" | "closed" | "full" | "past";

export type StateInput = Pick<
  EventRow,
  | "status"
  | "ctaType"
  | "registrationMode"
  | "startsAt"
  | "endsAt"
  | "capacity"
  | "seatsConfirmed"
  | "seatsHeld"
  | "registrationOpensAt"
  | "registrationClosesAt"
  | "registrationManuallyClosed"
>;

/** Past = (endsAt ?? startsAt) < now. */
export function isEventPast(e: Pick<EventRow, "startsAt" | "endsAt">, now: number): boolean {
  return (e.endsAt ?? e.startsAt) < now;
}

/** Seats still assignable; null = unlimited. Never negative. */
export function seatsRemaining(e: Pick<EventRow, "capacity" | "seatsConfirmed" | "seatsHeld">): number | null {
  if (e.capacity == null) return null;
  return Math.max(0, e.capacity - e.seatsConfirmed - e.seatsHeld);
}

/** True when pending requests occupy seats for this event (declared mode, needs a capacity). */
export function holdsSeats(e: Pick<EventRow, "pendingHoldsSeats" | "capacity">): boolean {
  return e.pendingHoldsSeats && e.capacity != null;
}

/**
 * Pure registration state. Used by UI AND by the server (register()): never trust the client.
 * Precedence: not_applicable > closed (unpublished) > past > closed (manual / date) > not_yet_open > full > open.
 */
export function getRegistrationState(e: StateInput, now: number): RegistrationState {
  if (e.ctaType !== "registration" || !e.registrationMode) return "not_applicable";
  if (e.status !== "published") return "closed";
  if (isEventPast(e, now)) return "past";
  if (e.registrationManuallyClosed) return "closed";
  if (e.registrationClosesAt != null && now >= e.registrationClosesAt) return "closed";
  if (e.registrationOpensAt != null && now < e.registrationOpensAt) return "not_yet_open";
  if (e.capacity != null && e.seatsConfirmed + e.seatsHeld >= e.capacity) return "full";
  return "open";
}
