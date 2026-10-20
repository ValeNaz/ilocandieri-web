import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type RoomTone = "white" | "orange" | "yellow" | "green";

/**
 * A full-bleed colored field. Backgrounds on the public site are ONLY these four. `--fg` / `--pop` are set per tone:
 * white: ink text, green accent · orange: ink text, white accent · yellow: ink text, green accent · green: white text, yellow accent.
 * Text contrast: ink on white/yellow/orange OK, white on green OK. NEVER white text on orange or yellow, nor ink on green.
 */
export function Room({ tone = "white", as: Tag = "section", className, children, ...rest }: HTMLAttributes<HTMLElement> & { tone?: RoomTone; as?: ElementType }) {
  return (
    <Tag className={cn("room", `room-${tone}`, "overflow-x-clip", className)} {...rest}>
      {children}
    </Tag>
  );
}

/** Page column (same as ui Container, full-width friendly). */
export function Wrap({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative mx-auto w-full max-w-[96rem] px-5 sm:px-10", className)} {...rest} />;
}
