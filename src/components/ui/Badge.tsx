import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "terracotta" | "olive" | "success" | "warning" | "danger";
const tones: Record<BadgeTone, string> = {
  neutral: "bg-paper-deep text-ink border-line",
  terracotta: "bg-terracotta-soft text-terracotta-deep border-terracotta/25",
  olive: "bg-sage-soft text-olive-deep border-sage",
  success: "bg-success-soft text-success border-success/25",
  warning: "bg-warning-soft text-warning border-warning/25",
  danger: "bg-danger-soft text-danger border-danger/25",
};

export function Badge({ tone = "neutral", children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide", tones[tone], className)}>
      {children}
    </span>
  );
}
