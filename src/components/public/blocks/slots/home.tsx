import { homeaSlots } from "./home-a";
import { homebSlots } from "./home-b";
import { homecSlots } from "./home-c";
import type { SlotMap } from "./types";

export const homeSlots: SlotMap = { ...homeaSlots, ...homebSlots, ...homecSlots };
