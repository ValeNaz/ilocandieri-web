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
  terracotta: "bg-terracotta text-paper on-dark",
  cobalto: "bg-cobalto text-paper on-dark",
  limone: "bg-limone text-ink",
  kraft: "bg-kraft text-ink",
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
  display: "text-[clamp(2.6rem,7.4vw,6rem)] font-extrabold leading-[0.99] tracking-[-0.03em]",
  xl: "text-[clamp(2rem,4.6vw,3.6rem)] font-extrabold leading-[1.04]",
  lg: "text-[clamp(1.7rem,3.2vw,2.5rem)] font-extrabold leading-[1.06]",
  md: "text-xl font-bold",
} as const;

export function Heading({ as: Tag = "h2", size = "xl", className, children, ...rest }: HTMLAttributes<HTMLHeadingElement> & { as?: ElementType; size?: keyof typeof sizes }) {
  return (
    <Tag className={cn(sizes[size], className)} {...rest}>
      {children}
    </Tag>
  );
}
