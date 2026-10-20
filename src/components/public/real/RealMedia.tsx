import { mediaSlot, type MediaSlotId } from "@/lib/media-slots";
import { cn } from "@/lib/utils";
import { resolveSlot } from "./resolve";
import { RealVideo } from "./RealVideo";

const DEFAULT_SIZES = "(min-width: 1024px) 50vw, 100vw";

/**
 * A space for a REAL photo or video (see src/lib/media-slots.ts). Source, in order: the media assigned in the admin
 * ("Foto e video reali"), a file in public/reali, a labelled placeholder (development or SHOW_MEDIA_SLOTS=1), nothing.
 * Frame: rounded, the photo is never tinted, cropped by `aspect`. Caption optional (the admin caption wins).
 */
export async function RealMedia({ id, className, caption, priority, sizes = DEFAULT_SIZES }: { id: MediaSlotId; className?: string; caption?: string; priority?: boolean; sizes?: string }) {
  const slot = mediaSlot(id);
  const ratio = { aspectRatio: slot.aspect };
  const inner = "relative overflow-hidden rounded-[2rem]";
  const media = await resolveSlot(id, { caption });
  if (!media) return null;
  if (media.origin === "placeholder") {
    return (
      <div className={cn(inner, "grid place-items-center border-2 border-dashed border-current p-6 text-center", className)} style={ratio} data-media-slot={id}>
        <div className="max-w-[34ch]">
          <p className="t-label">{slot.kind === "video" ? "Spazio video reale" : "Spazio foto reale"} · {id}</p>
          <p className="mt-2 text-sm leading-snug">{slot.need}</p>
        </div>
      </div>
    );
  }
  return (
    <figure className={className} data-media-slot={id} data-media-origin={media.origin}>
      <div className={inner} style={ratio}>
        {media.type === "video" ? (
          <RealVideo src={media.src} poster={media.poster} label={media.alt} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- real photos from the media library / public/reali, cropped by CSS
          <img className="absolute inset-0 size-full object-cover" src={media.src} alt={media.alt} width={media.width} height={media.height} sizes={sizes}
            loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" />
        )}
      </div>
      {media.caption && <figcaption className="mt-3 text-sm">{media.caption}</figcaption>}
    </figure>
  );
}
