import { Logo } from "@/components/brand/Logo";

/** The cooperative's logo (vector redraw of the official mark). Kept as `Wordmark` for existing call sites. */
export function Wordmark({ className, tone, compact }: { className?: string; tone?: "dark" | "light"; compact?: boolean }) {
  return <Logo className={className} tone={tone} compact={compact} />;
}
