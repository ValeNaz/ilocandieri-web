import { cn } from "@/lib/utils";

/**
 * The I Locandieri mark, redrawn as vector from the official logo (public/brand/logo-originale.svg):
 * a house made of people. The orange figure is the roof and the left wall, the yellow figure the right wall,
 * the green dot is the person welcomed inside, the green bar the foundation.
 * Each part has its own class so the mark can assemble itself (journey.css `.logo-build`).
 */
export function LogoMark({ className, build }: { className?: string; build?: boolean | "view" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 126 156" className={cn("shrink-0 overflow-visible", build === "view" ? "logo-build-view" : build && "logo-build", className)}>
      <g className="lm-orange">
        <circle cx="14" cy="22" r="12.5" fill="var(--color-brand-orange)" />
        <path d="M71 3H78V36L27 75V122H1V66Z" fill="var(--color-brand-orange)" />
      </g>
      <g className="lm-yellow">
        <circle cx="110" cy="22" r="13" fill="var(--color-brand-yellow)" />
        <path d="M79 40L124 71V122H96V84L79 69Z" fill="var(--color-brand-yellow)" />
      </g>
      <circle className="lm-dot" cx="62" cy="99" r="13.5" fill="var(--color-brand-green)" />
      <rect className="lm-base" x="28" y="125" width="68" height="29" fill="var(--color-brand-green)" />
    </svg>
  );
}

/** Full logo: mark + "LOCANDIERI / COOPERATIVA SOCIALE". `tone="light"` sets the name in paper (dark fields). */
export function Logo({ className, tone = "dark", build, compact }: { className?: string; tone?: "dark" | "light"; build?: boolean; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark build={build} className={compact ? "h-9 w-auto" : "h-11 w-auto"} />
      <span className="flex flex-col whitespace-nowrap leading-none">
        <span className={cn("font-sans text-[0.98rem] font-medium uppercase tracking-[0.22em] sm:text-[1.05rem] sm:tracking-[0.26em]", tone === "light" ? "text-paper" : "text-ink", compact && "text-[0.95rem]")}>Locandieri</span>
        <span className={cn("mt-1.5 font-sans text-[0.58rem] font-medium uppercase tracking-[0.28em] sm:text-[0.62rem] sm:tracking-[0.3em]", tone === "light" ? "text-citrus" : "text-terracotta-deep")}>Cooperativa sociale</span>
      </span>
    </span>
  );
}
