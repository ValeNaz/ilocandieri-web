import type { ComponentType } from "react";
import type { ParsedBlock } from "@/lib/content/blocks";
import type { ImageMap } from "@/lib/content/queries";
import type { HeadingLevel } from "../shared";

/** Props every custom slot view receives. `data` is the validated block data (shape depends on the block type). */
export type SlotProps = { data: never; images: ImageMap; level: HeadingLevel; block: ParsedBlock };
export type SlotView = ComponentType<SlotProps>;
/** Keyed by `${pageKey}:${slot}`, e.g. "home:hero". A registered view REPLACES the generic renderer for that block. */
export type SlotMap = Record<string, SlotView>;
