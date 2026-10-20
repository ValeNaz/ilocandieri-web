import { LogoMark } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

/**
 * The cooperative's mark plus its name. The mark is whole and still; it only fades in once on load (kit.css .logo-build).
 * Sizes are inline (Tailwind) as well as in chrome.css, because the admin uses it without the public stylesheet.
 * `tone="light"` (green fields): the mark sits on a white tag so its green parts stay visible.
 */
export function Wordmark({ className, tone, compact }: { className?: string; tone?: "dark" | "light"; compact?: boolean }) {
  return (
    <span className={cn("wm inline-flex items-center gap-[0.7rem]", tone === "light" && "wm-tag", compact && "wm-compact", className)}>
      <LogoMark build className={cn("wm-mark w-auto", compact ? "h-[2.1rem]" : "h-[2.4rem]")} />
      <span className="wm-text flex flex-col gap-[0.3rem] whitespace-nowrap leading-none">
        <span className="wm-name font-display text-[1.1rem] font-bold">Locandieri</span>
        <span className="wm-sub text-[0.72rem] font-medium text-brand-green">Cooperativa sociale</span>
      </span>
    </span>
  );
}
