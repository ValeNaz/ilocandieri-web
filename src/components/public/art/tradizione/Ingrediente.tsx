import type { CSSProperties, ReactNode } from "react";
import { Room, Wrap, type RoomTone } from "@/components/public/kit/Room";
import "./tradizione.css";

/** Una stanza della Tradizione: una grande illustrazione-oggetto su un lato e un testo breve dall'altro. */
/** `real`: la foto reale che prova quello che il disegno racconta, sotto il testo; senza file sparisce senza lasciare buchi. */
export function Ingrediente({ id, tone, side = "left", ar = "14/15", label, scene, children, real }: {
  id: string; tone: RoomTone; side?: "left" | "right"; ar?: string; label: string; scene: ReactNode; children: ReactNode; real?: ReactNode;
}) {
  return (
    <Room tone={tone} id={id} aria-labelledby={`${id}-t`} className="ing">
      <Wrap>
        <div className="ing-grid" data-side={side}>
          <div className="ing-obj rise" style={{ "--ar": ar } as CSSProperties}>{scene}</div>
          <div className="ing-text">
            <p className="t-label ing-label">{label}</p>
            {children}
            {real}
          </div>
        </div>
      </Wrap>
    </Room>
  );
}
