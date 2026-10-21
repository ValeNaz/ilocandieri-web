import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The ABES logo, as supplied (public/brand/abes-logo.webp, cropped to its ink, transparent background). A raster
 * with its own colours: only its width is set from outside (height follows the 1200x699 ratio), never stretched.
 * Dark lettering: it always sits on white (or, at most, yellow).
 */
export function AbesLogo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/brand/abes-logo.webp"
      alt="ABES, l'agricoltura biologica e sociale"
      width={1200}
      height={699}
      sizes="(min-width: 1024px) 20rem, 15rem"
      priority={priority}
      className={cn("block h-auto", className)}
    />
  );
}
