import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, wide, ...rest }: HTMLAttributes<HTMLDivElement> & { wide?: boolean }) {
  return <div className={cn("mx-auto w-full px-5 sm:px-8", wide ? "max-w-[88rem]" : "max-w-6xl", className)} {...rest} />;
}

type Tone = "paper" | "deep" | "sage" | "ink" | "terracotta" | "cobalto" | "limone" | "kraft" | "olive";
const tones: Record<Tone, string> = {
  paper: "",
  deep: "bg-paper-deep",
  sage: "bg-sage-soft",
  ink: "bg-ink text-paper on-dark",
  terracotta: "bg-terracotta-soft",
  cobalto: "bg-paper-deep",
  limone: "bg-paper-deep",
  kraft: "bg-paper-deep",
  olive: "bg-olive-deep text-paper on-dark",
};

export function Section({ tone = "paper", className, children, ...rest }: HTMLAttributes<HTMLElement> & { tone?: Tone }) {
  return (
    <section className={cn("py-12 sm:py-24", tones[tone], className)} {...rest}>
      {children}
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("mb-5", className)}>
      <span className="stamp">{children}</span>
    </p>
  );
}

const sizes = {
  display: "text-[clamp(2.4rem,5.6vw,4.4rem)] font-semibold leading-[1.04] tracking-[-0.03em]",
  xl: "text-[clamp(1.9rem,3.8vw,3rem)] font-semibold leading-[1.08] tracking-[-0.025em]",
  lg: "text-[clamp(1.5rem,2.6vw,2.1rem)] font-semibold leading-[1.12]",
  md: "text-xl font-semibold",
} as const;

export function Heading({ as: Tag = "h2", size = "xl", className, children, ...rest }: HTMLAttributes<HTMLHeadingElement> & { as?: ElementType; size?: keyof typeof sizes }) {
  return (
    <Tag className={cn(sizes[size], className)} {...rest}>
      {children}
    </Tag>
  );
}
