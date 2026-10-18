import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "olive" | "light";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "group/btn inline-flex items-center justify-center gap-2 rounded-full font-medium leading-none whitespace-nowrap select-none " +
  "transition-[background-color,color,box-shadow,transform,border-color] duration-200 ease-out-soft " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-terracotta text-white hover:bg-terracotta-deep shadow-[0_8px_20px_-10px_rgb(178_61_20/0.7)]",
  secondary: "border border-ink/80 text-ink hover:bg-ink hover:text-paper",
  ghost: "text-ink hover:bg-paper-deep",
  danger: "bg-danger text-white hover:bg-[#7f1c19]",
  olive: "bg-olive text-white hover:bg-olive-deep",
  light: "bg-paper text-ink hover:bg-white",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-4 text-sm",
  md: "min-h-11 px-6 text-[0.95rem]",
  lg: "min-h-13 px-8 text-base",
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
