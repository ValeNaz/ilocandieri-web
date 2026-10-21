import type { CSSProperties, ReactNode } from "react";
import { mediaSlot, type MediaSlotId } from "@/lib/media-slots";
import { cn } from "@/lib/utils";
import { Deco, type DecoName } from "./Deco";
import { resolveSlot } from "./resolve";
import { RealVideo } from "./RealVideo";
import "./photo.css";

const DEFAULT_SIZES = "(min-width: 1024px) 50vw, 100vw";
export type FrameShape = "rect" | "arch" | "window" | "round" | "polaroid";

/**
 * A space for a REAL photo or video (see src/lib/media-slots.ts). Source, in order: the media assigned in the admin
 * ("Foto e video reali"), a file in public/reali, a provisional stock photo (credited on the frame), a labelled
 * placeholder (only with SHOW_MEDIA_SLOTS=1), nothing. Nothing = the caller's layout must hold without it.
 * Frame (photo.css): 28px corners or one of the shared masks, photo warmed toward the palette, paper grain, optional
 * drawn pieces breaking the frame (`deco`).
 */
export async function RealMedia({ id, className, caption, priority, sizes = DEFAULT_SIZES, shape = "rect", deco = [], tilt, aspect, children }: {
  id: MediaSlotId; className?: string; caption?: string; priority?: boolean; sizes?: string;
  shape?: FrameShape; deco?: DecoName[]; tilt?: number; aspect?: string; children?: ReactNode;
}) {
  const slot = mediaSlot(id);
  const ratio = { aspectRatio: aspect ?? slot.aspect };
  const media = await resolveSlot(id, { caption });
  if (!media) return null;
  if (media.origin === "placeholder") {
    return (
      <div className={cn("relative grid place-items-center overflow-hidden rounded-[28px] border-2 border-dashed border-current p-6 text-center", className)} style={ratio} data-media-slot={id}>
        <div className="max-w-[34ch]">
          <p className="t-label">{slot.kind === "video" ? "Spazio video reale" : "Spazio foto reale"} · {id}</p>
          <p className="mt-2 text-sm leading-snug">{slot.need}</p>
        </div>
      </div>
    );
  }
  const caption2 = media.origin === "stock" ? undefined : media.caption;
  return (
    <figure className={cn("pf", `pf-${shape}`, className)} style={tilt != null ? ({ "--tilt": `${tilt}deg` } as CSSProperties) : undefined} data-media-slot={id} data-media-origin={media.origin}>
      <div className="pf-box" style={ratio}>
        {media.type === "video" ? (
          <RealVideo src={media.src} poster={media.poster} label={media.alt} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- real photos from the media library / public, cropped by CSS
          <img src={media.src} alt={media.alt} width={media.width} height={media.height} sizes={sizes}
            srcSet={media.origin === "stock" && media.type === "photo" && media.small ? `${media.small} 1000w, ${media.src} ${media.width ?? 2000}w` : undefined}
            loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" />
        )}
        {children}
        {media.origin === "stock" && (
          <a className="pf-credit" href={media.credit.url} target="_blank" rel="noopener noreferrer">{media.type === "video" ? "Video indicativo" : "Foto indicativa"} · {media.credit.author} / Pexels</a>
        )}
      </div>
      {deco.map((d) => <Deco key={d} name={d} />)}
      {caption2 && <figcaption className="pf-caption">{caption2}</figcaption>}
    </figure>
  );
}
