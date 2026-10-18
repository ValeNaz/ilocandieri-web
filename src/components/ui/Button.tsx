import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "olive" | "light" | "limone";
export type ButtonSize = "sm" | "md" | "lg";

// "Sticker" buttons: flat color, 2px ink outline, hard offset shadow that collapses when pressed.
const base =
  "group/btn inline-flex items-center justify-center gap-2 rounded-full border-2 font-semibold leading-none whitespace-nowrap select-none " +
  "transition-[background-color,color,box-shadow,transform,border-color] duration-200 ease-out-expo " +
  "disabled:pointer-events-none disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55";

const variants: Record<ButtonVariant, string> = {
  primary: "border-ink bg-terracotta text-white hover:bg-terracotta-deep",
  secondary: "border-ink bg-transparent text-ink hover:bg-ink hover:text-paper",
  ghost: "border-transparent text-ink hover:bg-paper-deep",
  danger: "border-danger bg-danger text-white hover:bg-ink hover:border-ink",
  olive: "border-ink bg-olive text-white hover:bg-olive-deep",
  light: "border-paper bg-paper text-ink hover:bg-limone hover:border-limone",
  limone: "border-ink bg-limone text-ink hover:bg-paper",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-4 text-sm",
  md: "min-h-11 px-6 text-[0.95rem]",
  lg: "min-h-13 px-8 text-base",
};

// Hard shadow only on the filled, "sticker" variants and only from md up (dense admin tables stay calm).
const lifted: ButtonVariant[] = ["primary", "limone", "olive"];
const liftedClasses =
  "shadow-[3px_3px_0_0_var(--color-ink)] hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_0_var(--color-ink)] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_0_var(--color-ink)]";

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], size !== "sm" && lifted.includes(variant) && liftedClasses, className);
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
