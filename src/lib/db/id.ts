import { createId } from "@paralleldrive/cuid2";

/** Generate a new primary key (cuid2). */
export const newId = (): string => createId();
