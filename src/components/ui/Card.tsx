import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "paper" | "deep" | "sage" | "terracotta" | "ink" | "label";
const tones: Record<Tone, string> = {
  paper: "bg-card border border-line",
  deep: "bg-paper-deep border border-line",
  sage: "bg-sage-soft border border-sage/60",
  terracotta: "bg-terracotta-soft border border-terracotta/20",
  ink: "bg-ink text-paper border border-ink on-dark",
  // Public forms and info panels: a printed label with a second color plate peeking out.
  label: "bg-card border-[3px] border-ink shadow-[0.5rem_0.5rem_0_0_var(--color-limone)]",
};

export function Card({ tone = "paper", interactive, className, ...rest }: HTMLAttributes<HTMLDivElement> & { tone?: Tone; interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-card",
        tone !== "label" && "shadow-card",
        tones[tone],
        interactive && "transition-[transform,box-shadow] duration-300 ease-out-soft hover:-translate-y-1 hover:shadow-pop",
        className,
      )}
      {...rest}
    />
  );
}
