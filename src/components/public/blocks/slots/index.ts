import { aboutSlots } from "./about";
import { homeSlots } from "./home";
import { pagesSlots } from "./pages";
import { shopSlots } from "./shop";
import type { SlotMap } from "./types";

export const SLOT_VIEWS: SlotMap = { ...homeSlots, ...aboutSlots, ...shopSlots, ...pagesSlots };
