import { Fragment, type CSSProperties, type ElementType } from "react";
import { cn } from "@/lib/utils";

/**
 * Heading whose words (or letters, `by="char"`) enter one after the other on load (kit.css .kin). Server component.
 * The accessible name is the plain text; pieces are aria-hidden. `delay` in ms.
 */
export function Kinetic({ text, as: Tag = "h2", by = "word", className, delay = 0 }: { text: string; as?: ElementType; by?: "word" | "char"; className?: string; delay?: number }) {
  const words = text.split(/\s+/).filter(Boolean);
  let n = 0;
  return (
    <Tag className={cn("kin", className)} aria-label={text} style={{ "--kin-delay": `${delay}ms` } as CSSProperties}>
      <span aria-hidden="true">
        {words.map((w, wi) =>
          by === "word" ? (
            <Fragment key={wi}><span className="kw" style={{ "--i": wi } as CSSProperties}>{w}</span>{" "}</Fragment>
          ) : (
            <Fragment key={wi}>
              <span className="inline-block whitespace-nowrap">
                {[...w].map((c, ci) => <span key={ci} className="kc" style={{ "--i": n++ } as CSSProperties}>{c}</span>)}
              </span>{" "}
            </Fragment>
          ),
        )}
      </span>
    </Tag>
  );
}

/** Words that light up as they scroll past (view timeline). */
export function LitWords({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split(/\s+/).map((w, i) => (
        <Fragment key={i}><span className="lit-word">{w}</span>{" "}</Fragment>
      ))}
    </span>
  );
}
