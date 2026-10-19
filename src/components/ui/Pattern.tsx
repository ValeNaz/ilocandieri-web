import { cn } from "@/lib/utils";

type Variant = "agrumi" | "maiolica" | "campi";

/**
 * Quiet stand-in for missing imagery (no stock photos, no grey placeholders): sand with a light drawing.
 * Purely decorative: aria-hidden. Sizes to its parent.
 */
export function Pattern({ variant = "agrumi", className }: { variant?: Variant; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("relative isolate overflow-hidden bg-paper-deep", className)}>
      {variant === "agrumi" && (
        <svg className="absolute inset-0 size-full" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
          <circle cx="100" cy="100" r="34" fill="var(--color-arancio)" opacity=".55" />
          <circle cx="100" cy="100" r="27" fill="none" stroke="var(--color-paper)" strokeWidth="1.6" />
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1="100" y1="100" x2={100 + 27 * Math.cos((i * Math.PI) / 4)} y2={100 + 27 * Math.sin((i * Math.PI) / 4)} stroke="var(--color-paper)" strokeWidth="1.6" />
          ))}
        </svg>
      )}
      {variant === "maiolica" && (
        <svg className="absolute inset-0 size-full" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 8 }).map((_, i) => (
            <path key={i} d={`M0 ${30 + i * 20} Q25 ${10 + i * 20} 50 ${30 + i * 20} T100 ${30 + i * 20} T150 ${30 + i * 20} T200 ${30 + i * 20}`} fill="none" stroke="var(--color-kraft-deep)" strokeOpacity=".45" strokeWidth="1.5" />
          ))}
        </svg>
      )}
      {variant === "campi" && (
        <svg className="absolute inset-0 size-full" viewBox="0 0 200 200" preserveAspectRatio="none">
          {Array.from({ length: 9 }).map((_, i) => (
            <path key={i} d={`M0 ${30 + i * 20} C 50 ${10 + i * 20}, 120 ${50 + i * 20}, 200 ${24 + i * 20}`} fill="none" stroke="var(--color-sage)" strokeOpacity=".6" strokeWidth="1.5" />
          ))}
        </svg>
      )}
    </div>
  );
}
