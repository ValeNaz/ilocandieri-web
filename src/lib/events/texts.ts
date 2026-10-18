import { findBlock, getPageBlocks, type PageContent } from "@/lib/content/queries";
import { DEFAULT_MESSAGES, MODE_COPY, type PageMessages } from "./messages";
import type { RegistrationMode } from "./state";

export type EventTexts = {
  content: PageContent;
  mode: Record<RegistrationMode, { intro: string; button: string }>;
  messages: PageMessages;
};

/**
 * Admin-editable microcopy of the /eventi page (CONTENT module `message` blocks, slots state_*),
 * falling back to the dossier 05 text when a block is missing/hidden.
 */
export async function getEventTexts(): Promise<EventTexts> {
  const content = await getPageBlocks("eventi");
  const msg = (slot: string) => findBlock(content, slot, "message")?.data;
  const mode = {} as EventTexts["mode"];
  for (const m of ["open", "limited", "reserved", "approval"] as const) {
    const b = msg(`state_${m}`);
    mode[m] = { intro: b?.text || MODE_COPY[m].intro, button: b?.buttonLabel || MODE_COPY[m].button };
  }
  const messages: PageMessages = {};
  for (const k of ["confirmed", "pending", "full", "closed", "past"] as const) messages[k] = msg(`state_${k}`)?.text || DEFAULT_MESSAGES[k];
  return { content, mode, messages };
}
