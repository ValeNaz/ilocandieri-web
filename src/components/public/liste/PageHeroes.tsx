import type { ReactNode } from "react";
import { ContactScene, CreditsScene, EventsScene, LostScene, NewsScene, ReadingScene } from "@/components/public/art/liste/scenes";
import { ListHero } from "./ListHero";

type Common = { title: string; text?: string; eyebrow?: string; level?: 1 | 2; actions?: ReactNode };

export const EventsHero = (p: Common) => <ListHero tone="orange" scene={<EventsScene />} {...p} />;
export const NewsHero = (p: Common) => <ListHero tone="yellow" scene={<NewsScene />} {...p} />;
export const ContactHero = (p: Common) => <ListHero tone="green" scene={<ContactScene />} {...p} />;
export const LostHero = (p: Common) => <ListHero tone="orange" scene={<LostScene />} {...p} />;
export const CreditsHero = (p: Common) => <ListHero tone="yellow" scene={<CreditsScene />} {...p} />;
export const LegalHero = ({ kind, ...p }: Common & { kind: "privacy" | "cookie" }) => <ListHero tone="white" compact small scene={<ReadingScene kind={kind} />} {...p} />;
