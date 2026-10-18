import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, wide, ...rest }: HTMLAttributes<HTMLDivElement> & { wide?: boolean }) {
  return <div className={cn("mx-auto w-full px-5 sm:px-8", wide ? "max-w-[88rem]" : "max-w-6xl", className)} {...rest} />;
}

type Tone = "paper" | "deep" | "sage" | "ink" | "terracotta";
const tones: Record<Tone, string> = {
  paper: "",
  deep: "bg-paper-deep",
  sage: "bg-sage-soft",
  ink: "bg-ink text-paper on-dark",
  terracotta: "bg-terracotta text-white on-dark",
};

export function Section({ tone = "paper", className, children, ...rest }: HTMLAttributes<HTMLElement> & { tone?: Tone }) {
  return (
    <section className={cn("py-16 sm:py-24", tones[tone], className)} {...rest}>
      {children}
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("mb-4 inline-flex items-center gap-3 text-[0.8rem] font-semibold uppercase tracking-[0.18em]", className)}>
      <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />
      {children}
    </p>
  );
}

const sizes = {
  display: "text-[clamp(2.5rem,7vw,5.25rem)] font-medium leading-[1.02]",
  xl: "text-[clamp(2rem,4.5vw,3.5rem)] font-medium",
  lg: "text-[clamp(1.6rem,3vw,2.25rem)] font-medium",
  md: "text-xl font-semibold",
} as const;

export function Heading({ as: Tag = "h2", size = "xl", className, children, ...rest }: HTMLAttributes<HTMLHeadingElement> & { as?: ElementType; size?: keyof typeof sizes }) {
  return (
    <Tag className={cn(sizes[size], className)} {...rest}>
      {children}
    </Tag>
  );
}
