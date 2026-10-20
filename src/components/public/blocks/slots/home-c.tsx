import { AbesBlock, EventsBlock, NewsBlock } from "../Dynamic";
import type { SlotProps, SlotMap } from "./types";

type D<T extends (a: never) => unknown> = Parameters<T>[0]["data"];
const Abes = ({ data, level }: SlotProps) => <AbesBlock data={data as D<typeof AbesBlock>} level={level} home />;
const Eventi = ({ data, level }: SlotProps) => <EventsBlock data={data as D<typeof EventsBlock>} level={level} />;
const News = ({ data, level }: SlotProps) => <NewsBlock data={data as D<typeof NewsBlock>} level={level} />;

export const homecSlots: SlotMap = { "home:abes": Abes, "home:eventi": Eventi, "home:news": News };
