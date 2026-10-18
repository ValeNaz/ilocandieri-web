import { cn } from "@/lib/utils";

type Variant = "agrumi" | "maiolica" | "campi";

/**
 * Typographic/chromatic stand-in for missing imagery (no stock photos, no grey placeholders).
 * Purely decorative: aria-hidden. Sizes to its parent.
 */
export function Pattern({ variant = "agrumi", className }: { variant?: Variant; className?: string }) {
  const bg: Record<Variant, string> = {
    agrumi: "bg-terracotta",
    maiolica: "bg-olive",
    campi: "bg-paper-deep",
  };
  return (
    <div aria-hidden="true" className={cn("relative isolate overflow-hidden", bg[variant], className)}>
      {variant === "agrumi" && (
        <svg className="absolute inset-0 size-full" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="p-agrumi" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="34" fill="#e8802f" />
              <circle cx="50" cy="50" r="28" fill="none" stroke="#fbf6ec" strokeOpacity=".55" strokeWidth="2" />
              {Array.from({ length: 8 }).map((_, i) => (
                <line key={i} x1="50" y1="50" x2={50 + 28 * Math.cos((i * Math.PI) / 4)} y2={50 + 28 * Math.sin((i * Math.PI) / 4)} stroke="#fbf6ec" strokeOpacity=".55" strokeWidth="2" />
              ))}
              <circle cx="0" cy="0" r="12" fill="#8a2d0c" /><circle cx="100" cy="100" r="12" fill="#8a2d0c" />
              <circle cx="100" cy="0" r="12" fill="#8a2d0c" /><circle cx="0" cy="100" r="12" fill="#8a2d0c" />
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#p-agrumi)" />
        </svg>
      )}
      {variant === "maiolica" && (
        <svg className="absolute inset-0 size-full" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="p-maiolica" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M0 40 Q20 0 40 40 T80 40" fill="none" stroke="#a9b38a" strokeWidth="3" />
              <path d="M0 80 Q20 40 40 80 T80 80" fill="none" stroke="#a9b38a" strokeOpacity=".55" strokeWidth="3" />
              <circle cx="40" cy="20" r="5" fill="#e8802f" />
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#p-maiolica)" />
        </svg>
      )}
      {variant === "campi" && (
        <svg className="absolute inset-0 size-full" viewBox="0 0 200 200" preserveAspectRatio="none">
          {Array.from({ length: 9 }).map((_, i) => (
            <path key={i} d={`M0 ${30 + i * 20} C 50 ${10 + i * 20}, 120 ${50 + i * 20}, 200 ${24 + i * 20}`} fill="none" stroke={i % 3 === 0 ? "#e8802f" : "#a9b38a"} strokeWidth="2.5" />
          ))}
        </svg>
      )}
    </div>
  );
}
