import type { ComponentType } from "react";
import type { ParsedBlock } from "@/lib/content/blocks";
import type { ImageMap } from "@/lib/content/queries";
import type { HeadingLevel } from "../shared";

/** Props every custom slot view receives. `data` is the validated block data (shape depends on the block type). */
/** `siblings` = the other visible blocks of the same page (lets two blocks render as one section, e.g. home events + news). */
export type SlotProps = { data: never; images: ImageMap; level: HeadingLevel; block: ParsedBlock; siblings?: ParsedBlock[] };
export type SlotView = ComponentType<SlotProps>;
/** Keyed by `${pageKey}:${slot}`, e.g. "home:hero". A registered view REPLACES the generic renderer for that block. */
export type SlotMap = Record<string, SlotView>;
