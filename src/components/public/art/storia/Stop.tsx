import type { ReactNode } from "react";
import { Room, Wrap, type RoomTone } from "@/components/public/kit/Room";
import "./storia.css";

type Tone = RoomTone;
/** Una tappa del percorso: una stanza con la scena (pannello arrotondato) da un lato e il testo dall'altro. */
/** `real`: due foto reali (prima, adesso) da mettere sotto la scena e sotto il testo; spariscono senza file, senza lasciare buchi. */
export function Stop({ n, id, tone, panel, ar = "5/4", side = "left", scene, children, label, real }: {
  n: number; id: string; tone: Tone; panel: Tone; ar?: string; side?: "left" | "right"; scene: ReactNode; children: ReactNode; label: string; real?: ReactNode;
}) {
  return (
    <Room tone={tone} id={id} data-stop data-side={side} aria-labelledby={`${id}-t`} className="stop">
      <Wrap>
        <div className="stop-grid">
          <div className="stop-scene">
            <div className={`panel panel-${panel} rise`} style={{ "--ar": ar } as React.CSSProperties}>{scene}</div>
          </div>
          <div className="stop-text">
            <p className="t-label stop-label" style={{ color: "var(--fg)" }}><span className="stop-n">{String(n).padStart(2, "0")}</span> {label}</p>
            {children}
          </div>
          {real}
        </div>
      </Wrap>
    </Room>
  );
}
