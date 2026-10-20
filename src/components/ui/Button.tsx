import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "olive" | "light" | "limone" | "ink";
export type ButtonSize = "sm" | "md" | "lg";

// Pill buttons: solid accent for the main action, outline for the rest.
const base =
  "inline-flex items-center justify-center gap-2 rounded-full border font-semibold leading-none whitespace-nowrap select-none " +
  "transition-[background-color,color,border-color] duration-200 ease-out-expo " +
  "disabled:pointer-events-none disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55";

const variants: Record<ButtonVariant, string> = {
  primary: "border-ink bg-ink text-white hover:border-brand-green hover:bg-brand-green",
  secondary: "border-line-strong bg-transparent text-ink hover:border-ink hover:bg-paper-deep",
  ghost: "border-transparent text-ink hover:bg-paper-deep",
  danger: "border-danger bg-danger text-white hover:bg-ink hover:border-ink",
  olive: "border-brand-green bg-brand-green text-white hover:bg-ink hover:border-ink",
  light: "border-white bg-white text-ink hover:bg-brand-yellow hover:border-brand-yellow",
  limone: "border-ink bg-brand-yellow text-ink hover:bg-white",
  ink: "border-ink bg-ink text-paper hover:bg-ink-soft hover:border-ink-soft",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-4 text-sm",
  md: "min-h-11 px-5 text-[0.95rem]",
  lg: "min-h-12 px-7 text-base",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type Common = { variant?: ButtonVariant; size?: ButtonSize; pending?: boolean; children?: ReactNode };

export function Button({ variant, size, pending, className, children, disabled, type = "button", ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} disabled={disabled || pending} aria-busy={pending || undefined} className={buttonClasses(variant, size, className)} {...rest}>
      {pending && <Spinner />}
      {children}
    </button>
  );
}

/** Link styled as a button. External (http/mailto/tel) URLs render a plain <a>. */
export function ButtonLink({ variant, size, className, href, children, external, ...rest }: Common & Omit<ComponentProps<typeof Link>, "href"> & { href: string; external?: boolean }) {
  const cls = buttonClasses(variant, size, className);
  if (external || /^(https?:|mailto:|tel:)/.test(href)) {
    const isHttp = /^https?:/.test(href);
    return (
      <a href={href} className={cls} {...(isHttp ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
        {isHttp && <span className="sr-only"> (si apre in una nuova scheda)</span>}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}

export function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
