import { cn } from "@/lib/utils";
import { OrangeMark } from "./art/primitives";

/** Typographic wordmark in crate lettering (the official logo asset has not been supplied yet). */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-display text-[1.35rem] font-extrabold uppercase leading-none tracking-[-0.01em]", className)}>
      <OrangeMark className="size-8" />
      <span className="leading-[0.9]">I Locandieri</span>
    </span>
  );
}
