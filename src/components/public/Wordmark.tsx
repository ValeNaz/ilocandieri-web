import { cn } from "@/lib/utils";
import { OrangeMark } from "./art/primitives";

/** Typographic wordmark (the official logo asset has not been supplied yet). */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-display text-[1.2rem] font-semibold leading-none tracking-[-0.02em]", className)}>
      <OrangeMark className="size-7" />
      <span>I Locandieri</span>
    </span>
  );
}
