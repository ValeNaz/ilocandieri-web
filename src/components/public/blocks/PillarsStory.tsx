"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { storyFor } from "../art/story";
import { AmbientVideo } from "../media/AmbientVideo";
import { PHOTOS, VIDEOS, type PhotoKey, type VideoKey } from "../media/stock";

type Item = { title: string; text: string };
type Scene = { photo: PhotoKey } | { video: VideoKey };

/** The scene for an activity, chosen from its title (so editing the text keeps the right picture). */
function sceneFor(title: string, i: number): Scene {
  const t = title.toLowerCase();
  if (/accogl|inclus/.test(t)) return { video: "germoglio" };
  if (/confisc|beni/.test(t)) return { photo: "casale" };
  if (/sport|campo/.test(t)) return { video: "pallone" };
  if (/agric|abes|terra|coltiv/.test(t)) return { video: "granoTramonto" };
  return ([{ video: "luce" }, { photo: "belice" }, { video: "semina" }, { video: "olive" }] as Scene[])[i % 4]!;
}

function SceneMedia({ scene, hold, inStack, className }: { scene: Scene; hold: boolean; inStack?: boolean; className?: string }) {
  if ("video" in scene) return <AmbientVideo video={VIDEOS[scene.video]} hold={hold} hideControl={inStack} className={cn("absolute inset-0 size-full", className)} />;
  return <Image src={PHOTOS[scene.photo].src} alt="" fill sizes="(min-width:1024px) 45vw, 90vw" className={cn("object-cover", className)} />;
}

/**
 * "Cosa facciamo" told as a story: the activities scroll on the left, each with its line drawing; on the right a
 * fixed window changes scene to match the one you are reading. On small screens each activity carries its own scene.
 */
export function PillarsStory({ items }: { items: Item[] }) {
  const [active, setActive] = useState(0);
  const [stopped, setStopped] = useState(false);
  const rows = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    rows.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, [items.length]);

  return (
    <div className="mt-14 grid gap-12 sm:mt-20 lg:grid-cols-12 lg:gap-16">
      <ol className="lg:col-span-6">
        {items.map((it, i) => {
          const Drawing = storyFor(it.title, i);
          return (
            <li
              key={i}
              ref={(el) => { rows.current[i] = el; }}
              data-index={i}
              className={cn("border-t border-paper/15 py-10 transition-opacity duration-700 lg:min-h-[62svh] lg:py-16", i !== active && "lg:opacity-45")}
            >
              <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-[1.25rem] lg:hidden">
                <SceneMedia scene={sceneFor(it.title, i)} hold={stopped} />
              </div>
              <div className="flex items-start gap-5">
                <Drawing className="h-16 w-16 shrink-0 sm:h-20 sm:w-20" />
                <div>
                  <p aria-hidden="true" className="text-sm font-semibold tabular-nums text-citrus">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-2 text-[clamp(1.9rem,4vw,3.4rem)] leading-[1.02] tracking-[-0.03em]">{it.title}</h3>
                  <p className="mt-4 max-w-md text-lg leading-relaxed text-night-soft">{it.text}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="hidden lg:col-span-6 lg:block">
        <div className="sticky top-[calc(var(--header-h)+2rem)] aspect-[4/5] max-h-[calc(100svh-var(--header-h)-4rem)] w-full overflow-hidden rounded-[1.75rem]">
          <div className="story-media absolute inset-0">
            {items.map((it, i) => (
              <div key={i} data-active={i === active} className="absolute inset-0">
                <SceneMedia scene={sceneFor(it.title, i)} hold={stopped || i !== active} inStack />
              </div>
            ))}
          </div>
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night/70 to-transparent" />
          <p aria-hidden="true" className="absolute bottom-6 left-6 right-20 text-2xl leading-tight tracking-[-0.02em] text-paper">{items[active]?.title}</p>
          <button
            type="button"
            onClick={() => setStopped((v) => !v)}
            className="absolute bottom-5 right-5 inline-flex size-10 items-center justify-center rounded-full bg-ink/45 text-paper backdrop-blur-sm transition-colors hover:bg-ink/70"
            aria-label={stopped ? "Riproduci i video di questa sezione" : "Metti in pausa i video di questa sezione"}
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="currentColor">
              {stopped ? <path d="M6 4.5v11l9-5.5z" /> : <path d="M5.5 4h3v12h-3zM11.5 4h3v12h-3z" />}
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
