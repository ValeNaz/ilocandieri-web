import { and, asc, count, eq, inArray, like, ne } from "drizzle-orm";
import { db as defaultDb, newId, schema, type Db } from "@/lib/db";
import { DEFAULT_FIELDS, getLatestFormVersion, saveFormFields } from "./forms";
import { holdsSeats } from "./state";
import { runTx, TxAbort } from "./tx";
import type { EventInput } from "./validation";
import { slugify } from "@/lib/utils";

const E = schema.events;
const R = schema.registrations;

export type SaveEventResult = { ok: true; id: string } | { ok: false; message: string; fieldErrors?: Record<string, string> };

/** Create (id=null) or update an event. All business guards live here, not in the UI. */
export async function saveEvent(id: string | null, input: EventInput, d: Db = defaultDb): Promise<SaveEventResult> {
  const { fields, ...row } = input;
  const bad = (message: string, fieldErrors: Record<string, string>): SaveEventResult => ({ ok: false, message, fieldErrors });

  const [clash] = await d.select({ id: E.id }).from(E).where(id ? and(eq(E.slug, row.slug), ne(E.id, id)) : eq(E.slug, row.slug));
  if (clash) return bad("Controlla i campi.", { slug: "Esiste già un evento con questo indirizzo: modificalo." });
  if (row.coverId) {
    const [m] = await d.select({ id: schema.media.id }).from(schema.media).where(eq(schema.media.id, row.coverId));
    if (!m) return bad("Controlla i campi.", { coverId: "L'immagine scelta non esiste più." });
  }
  if (row.categoryId) {
    const [c] = await d.select({ id: schema.eventCategories.id }).from(schema.eventCategories).where(eq(schema.eventCategories.id, row.categoryId));
    if (!c) return bad("Controlla i campi.", { categoryId: "La categoria scelta non esiste più." });
  }

  const result = await runTx<SaveEventResult>(async (tx) => {
    const now = Date.now();
    let eventId = id;
    if (!id) {
      eventId = newId();
      await tx.insert(E).values({ id: eventId, ...row, createdAt: now, updatedAt: now });
    } else {
      const [cur] = await tx.select().from(E).where(eq(E.id, id));
      if (!cur) throw new TxAbort<SaveEventResult>({ ok: false, message: "Evento non trovato." });
      const [{ pending }] = await tx.select({ pending: count() }).from(R).where(and(eq(R.eventId, id), eq(R.status, "pending")));
      const next = { pendingHoldsSeats: row.pendingHoldsSeats, capacity: row.capacity };
      if (pending > 0 && holdsSeats(cur) !== holdsSeats(next)) {
        throw new TxAbort<SaveEventResult>(bad("Controlla i campi.", { pendingHoldsSeats: `Ci sono ${pending} richieste in attesa: decidi prima su quelle, poi potrai cambiare capienza o riserva dei posti.` }));
      }
      if (row.capacity != null && row.capacity < cur.seatsConfirmed + cur.seatsHeld) {
        throw new TxAbort<SaveEventResult>(bad("Controlla i campi.", { capacity: `La capienza non può essere inferiore ai posti già assegnati (${cur.seatsConfirmed + cur.seatsHeld}).` }));
      }
      await tx.update(E).set({ ...row, updatedAt: now }).where(eq(E.id, id));
    }
    return { ok: true, id: eventId! };
  }, d);
  if (!result.ok) return result;

  if (row.ctaType === "registration") {
    const base = fields ?? (await getLatestFormVersion(result.id, d))?.fields ?? DEFAULT_FIELDS;
    await saveFormFields(result.id, base, row.registrationMode, d);
  }
  return result;
}

export async function uniqueSlug(base: string, d: Db = defaultDb): Promise<string> {
  const root = slugify(base) || "evento";
  const rows = await d.select({ slug: E.slug }).from(E).where(like(E.slug, `${root}%`));
  const taken = new Set(rows.map((r) => r.slug));
  if (!taken.has(root)) return root;
  for (let i = 2; i < 500; i++) if (!taken.has(`${root}-${i}`)) return `${root}-${i}`;
  return `${root}-${newId().slice(0, 6)}`;
}

/** Copy an event as a DRAFT (no registrations, counters at zero, not featured). */
export async function duplicateEvent(id: string, d: Db = defaultDb): Promise<string | null> {
  const [src] = await d.select().from(E).where(eq(E.id, id));
  if (!src) return null;
  const newEventId = newId();
  const slug = await uniqueSlug(`${src.slug}-copia`, d);
  const now = Date.now();
  const { id: _id, ...rest } = src;
  void _id;
  await d.insert(E).values({
    ...rest,
    id: newEventId,
    slug,
    title: `${src.title} (copia)`,
    status: "draft",
    featured: false,
    registrationManuallyClosed: false,
    seatsConfirmed: 0,
    seatsHeld: 0,
    createdAt: now,
    updatedAt: now,
  });
  const latest = await getLatestFormVersion(id, d);
  if (latest) await saveFormFields(newEventId, latest.fields, src.registrationMode, d);
  return newEventId;
}

export type DeleteEventResult = { ok: true; removedRegistrations: number } | { ok: false; reason: "not_found" | "has_registrations"; active: number; message: string };

/** Refuse when pending/confirmed registrations exist (hide the event instead); history of rejected/cancelled goes with it. */
export async function deleteEvent(id: string, d: Db = defaultDb): Promise<DeleteEventResult> {
  return runTx<DeleteEventResult>(async (tx) => {
    const [ev] = await tx.select({ id: E.id }).from(E).where(eq(E.id, id));
    if (!ev) throw new TxAbort<DeleteEventResult>({ ok: false, reason: "not_found", active: 0, message: "Evento non trovato." });
    const [{ active }] = await tx.select({ active: count() }).from(R).where(and(eq(R.eventId, id), inArray(R.status, ["pending", "confirmed"])));
    if (active > 0) {
      throw new TxAbort<DeleteEventResult>({ ok: false, reason: "has_registrations", active, message: `Non si può eliminare: ci sono ${active} iscrizioni attive (in attesa o confermate). Nascondi l'evento oppure annulla prima le iscrizioni.` });
    }
    const removed = await tx.delete(R).where(eq(R.eventId, id)).returning({ id: R.id });
    await tx.delete(E).where(eq(E.id, id));
    return { ok: true, removedRegistrations: removed.length };
  }, d);
}

// ---------- categories ----------
export async function listCategories(d: Db = defaultDb) {
  const rows = await d.select().from(schema.eventCategories).orderBy(asc(schema.eventCategories.name));
  const counts = await d.select({ categoryId: E.categoryId, n: count() }).from(E).groupBy(E.categoryId);
  return rows.map((c) => ({ ...c, events: counts.find((x) => x.categoryId === c.id)?.n ?? 0 }));
}

export async function saveCategory(id: string | null, name: string, d: Db = defaultDb): Promise<{ ok: true } | { ok: false; message: string }> {
  const clean = name.trim().replace(/\s+/g, " ");
  if (clean.length < 2 || clean.length > 60) return { ok: false, message: "Il nome deve avere da 2 a 60 caratteri." };
  const slug = slugify(clean);
  if (!slug) return { ok: false, message: "Nome non valido." };
  const [clash] = await d.select({ id: schema.eventCategories.id }).from(schema.eventCategories).where(id ? and(eq(schema.eventCategories.slug, slug), ne(schema.eventCategories.id, id)) : eq(schema.eventCategories.slug, slug));
  if (clash) return { ok: false, message: "Esiste già una categoria con questo nome." };
  if (id) await d.update(schema.eventCategories).set({ name: clean, slug }).where(eq(schema.eventCategories.id, id));
  else await d.insert(schema.eventCategories).values({ id: newId(), name: clean, slug });
  return { ok: true };
}

export async function deleteCategory(id: string, d: Db = defaultDb) {
  await d.delete(schema.eventCategories).where(eq(schema.eventCategories.id, id));
}
