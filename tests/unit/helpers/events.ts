import { eq } from "drizzle-orm";
import { db, newId, schema } from "@/lib/db";
import { DEFAULT_FIELDS, saveFormFields, type EventFormField } from "@/lib/events/forms";

export const DAY = 24 * 3600_000;

type EventInsert = typeof schema.events.$inferInsert;

/** Insert a published, upcoming registration event (+ default form v1). Override anything. */
export async function makeEvent(over: Partial<EventInsert> = {}, fields: EventFormField[] = DEFAULT_FIELDS) {
  const id = newId();
  const row = {
    id,
    slug: `evento-${id.slice(0, 8)}`,
    title: "Evento di prova",
    startsAt: Date.now() + 7 * DAY,
    status: "published" as const,
    ctaType: "registration" as const,
    registrationMode: "open" as const,
    ...over,
  } satisfies EventInsert;
  await db.insert(schema.events).values(row);
  await saveFormFields(id, fields, row.registrationMode ?? null);
  const [event] = await db.select().from(schema.events).where(eq(schema.events.id, id));
  return event!;
}

let n = 0;
/** Unique valid submission values for the default form. */
export function person(over: Record<string, unknown> = {}) {
  n += 1;
  return { name: `Persona ${n} Test`, email: `persona${n}-${Math.random().toString(36).slice(2, 8)}@example.test`, phone: "", ...over };
}

export async function getEvent(id: string) {
  const [e] = await db.select().from(schema.events).where(eq(schema.events.id, id));
  return e!;
}

export async function regsOf(eventId: string) {
  return db.select().from(schema.registrations).where(eq(schema.registrations.eventId, eventId));
}
