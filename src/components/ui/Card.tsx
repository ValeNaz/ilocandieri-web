import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "paper" | "deep" | "sage" | "terracotta" | "ink";
const tones: Record<Tone, string> = {
  paper: "bg-card border border-line",
  deep: "bg-paper-deep border border-line",
  sage: "bg-sage-soft border border-sage/60",
  terracotta: "bg-terracotta-soft border border-terracotta/20",
  ink: "bg-ink text-paper border border-ink on-dark",
};

export function Card({ tone = "paper", interactive, className, ...rest }: HTMLAttributes<HTMLDivElement> & { tone?: Tone; interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-card shadow-card",
        tones[tone],
        interactive && "transition-[transform,box-shadow] duration-300 ease-out-soft hover:-translate-y-1 hover:shadow-pop",
        className,
      )}
      {...rest}
    />
  );
}
