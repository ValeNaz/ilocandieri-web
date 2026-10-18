import { cn } from "@/lib/utils";

/** Typographic wordmark (the official logo asset has not been supplied yet). */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-display text-[1.4rem] font-semibold leading-none tracking-tight", className)}>
      <svg aria-hidden="true" viewBox="0 0 32 32" className="size-7 shrink-0">
        <circle cx="16" cy="16" r="14" fill="#e8802f" />
        <circle cx="16" cy="16" r="10.5" fill="none" stroke="#fbf6ec" strokeOpacity=".8" strokeWidth="1.4" />
        <path d="M16 5.5v21M5.5 16h21M8.6 8.6l14.8 14.8M23.4 8.6 8.6 23.4" stroke="#fbf6ec" strokeOpacity=".8" strokeWidth="1.2" />
      </svg>
      I Locandieri
    </span>
  );
}
