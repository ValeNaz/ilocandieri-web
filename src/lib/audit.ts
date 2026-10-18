import { db, newId, schema } from "@/lib/db";

/** Essential audit trail. NEVER put personal data in the arguments (ids only). */
export async function audit(userId: string | null, action: string, entity?: string, entityId?: string) {
  await db.insert(schema.auditLog).values({ id: newId(), userId, action, entity: entity ?? null, entityId: entityId ?? null });
}
