import type { EventFormInitial } from "@/components/admin/events/EventForm";
import { MESSAGE_KEYS, parseEventMessages } from "./messages";
import type { EventRow } from "./state";
import { msToRomeLocal } from "./time";

/** Map a DB row to the (string-only) initial values of the admin event form. */
export function toFormInitial(e: EventRow): EventFormInitial {
  const msgs = parseEventMessages(e.successMessage);
  return {
    id: e.id,
    title: e.title,
    slug: e.slug,
    summary: e.summary,
    bodyHtml: e.body,
    startsAt: msToRomeLocal(e.startsAt),
    endsAt: e.endsAt ? msToRomeLocal(e.endsAt) : "",
    location: e.location ?? "",
    coverId: e.coverId,
    categoryId: e.categoryId ?? "",
    audience: e.audience ?? "",
    status: e.status,
    featured: e.featured,
    ctaType: e.ctaType,
    ctaLabel: e.ctaLabel ?? "",
    ctaTarget: e.ctaTarget ?? "",
    whatsappText: msgs.whatsappText ?? "",
    registrationMode: e.registrationMode ?? "",
    capacity: e.capacity != null ? String(e.capacity) : "",
    maxSeatsPerRequest: String(e.maxSeatsPerRequest),
    pendingHoldsSeats: e.pendingHoldsSeats,
    reservedCriteria: e.reservedCriteria ?? "",
    registrationOpensAt: e.registrationOpensAt ? msToRomeLocal(e.registrationOpensAt) : "",
    registrationClosesAt: e.registrationClosesAt ? msToRomeLocal(e.registrationClosesAt) : "",
    registrationManuallyClosed: e.registrationManuallyClosed,
    privacyNote: e.privacyNote ?? "",
    messages: Object.fromEntries(MESSAGE_KEYS.map((k) => [k, msgs[k] ?? ""])) as EventFormInitial["messages"],
    seoTitle: e.seoTitle ?? "",
    seoDescription: e.seoDescription ?? "",
  };
}

export const emptyFormInitial = (): EventFormInitial => ({
  id: null, title: "", slug: "", summary: "", bodyHtml: "", startsAt: "", endsAt: "", location: "", coverId: null, categoryId: "", audience: "",
  status: "draft", featured: false, ctaType: "none", ctaLabel: "", ctaTarget: "", whatsappText: "", registrationMode: "", capacity: "",
  maxSeatsPerRequest: "1", pendingHoldsSeats: false, reservedCriteria: "", registrationOpensAt: "", registrationClosesAt: "",
  registrationManuallyClosed: false, privacyNote: "", messages: { confirmed: "", pending: "", full: "", closed: "", past: "", notYetOpen: "" }, seoTitle: "", seoDescription: "",
});
