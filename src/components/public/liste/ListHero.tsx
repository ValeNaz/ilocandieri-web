import type { ReactNode } from "react";
import { Kinetic } from "@/components/public/kit/Kinetic";
import { Room, Wrap, type RoomTone } from "@/components/public/kit/Room";
import { cn } from "@/lib/utils";
import "./liste.css";
import "../chrome.css";

/**
 * Opening room of every list/functional page: kicker, Kinetic title (h1 unless `level` says otherwise), lead, actions, and
 * the page's living scene (a <Stage> built in art/liste/scenes). Runs under the floating header like the other heroes.
 */
export function ListHero({ tone = "orange", eyebrow, title, text, actions, scene, level = 1, compact, small, id }: {
  tone?: RoomTone; eyebrow?: string; title: string; text?: string; actions?: ReactNode; scene: ReactNode; level?: 1 | 2; compact?: boolean; small?: boolean; id?: string;
}) {
  return (
    <Room tone={tone} id={id} className={cn("lh", compact && "lh-compact")}>
      <Wrap className="lh-in">
        <div className="lh-text">
          {eyebrow && <p className="lh-kicker t-label">{eyebrow}</p>}
          <Kinetic as={level === 1 ? "h1" : "h2"} text={title} className={cn("lh-title", small && "lh-title-s")} />
          {text && (
            <div className="lh-lead">{text.split(/\n{2,}/).map((p, i) => <p key={i} className={i ? "mt-3" : undefined}>{p}</p>)}</div>
          )}
          {actions && <div className="lh-actions">{actions}</div>}
        </div>
        <div className="lh-scene" aria-hidden="true">{scene}</div>
      </Wrap>
    </Room>
  );
}
