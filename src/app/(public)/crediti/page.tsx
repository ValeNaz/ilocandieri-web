import type { Metadata } from "next";
import { Room, Wrap } from "@/components/public/kit/Room";
import { CreditsHero } from "@/components/public/liste/PageHeroes";
import { resolveSlot } from "@/components/public/real/resolve";
import { MEDIA_SLOTS, mediaSlotPageLabel, type MediaSlotId } from "@/lib/media-slots";
import "@/components/public/liste/liste.css";

export const metadata: Metadata = { title: "Crediti", description: "Chi ha disegnato le illustrazioni del sito, da dove vengono foto e video e quali caratteri usiamo.", robots: { index: false } };

const ITEMS = [
  { h: "Illustrazioni", t: "Le illustrazioni sono originali, disegnate per questo sito. Le persone hanno la forma del logo: una testa tonda e un corpo a forma di casa. Sono tutte in SVG, nessuna viene da un archivio." },
  { h: "Caratteri", t: "Anybody per i titoli e Hanken Grotesk per i testi, entrambi con licenza SIL Open Font License, caricati tramite Google Fonts." },
];

/** Real photos and videos of the places that are online now (no placeholders), with their caption or description. */
async function placeMedia() {
  const ids = MEDIA_SLOTS.map((s) => s.id as MediaSlotId);
  const found = await Promise.all(ids.map(async (id) => ({ slot: MEDIA_SLOTS.find((s) => s.id === id)!, media: await resolveSlot(id, { showPlaceholder: false }) })));
  return found.flatMap(({ slot, media }) => (!media || media.origin === "placeholder" ? [] : [{
    id: slot.id,
    page: mediaSlotPageLabel(slot.page),
    kind: media.type === "video" ? "Video" : "Foto",
    text: media.origin === "stock" ? media.alt : media.caption || media.alt,
    credit: media.origin === "stock" ? media.credit : null,
  }]));
}

export default async function Page() {
  const media = await placeMedia();
  return (
    <>
      <CreditsHero eyebrow="Crediti" title="Chi ha fatto cosa." text="Illustrazioni, foto, video e caratteri di questo sito, con la loro provenienza." />
      <Room tone="white" className="lr-pad">
        <Wrap>
          <section aria-labelledby="foto-video" className="cut cut-yellow">
            <h2 id="foto-video" className="t-head">Fotografie e video</h2>
            <div className={media.length ? "mt-5 grid gap-6 lg:grid-cols-2 lg:gap-10" : "mt-5"}>
              <div className="t-body space-y-4">
                <p>Le foto dei prodotti sono di ABES, il progetto agricolo della cooperativa (abes.bio), e sono quelle che vedi nel negozio.</p>
                <p>Le foto e i video dei luoghi (il Giardino delle Arance, il Campo Polivalente, la casa dell&apos;accoglienza) sono della cooperativa I Locandieri. Dove c&apos;è, la didascalia accanto all&apos;immagine dice cosa mostra.</p>
                {media.some((m) => m.credit) && <p>Alcune foto sono ancora indicative: vengono da Pexels (licenza Pexels, uso libero) e mostrano luoghi simili ai nostri, non i nostri. Le trovi segnate &quot;Foto indicativa&quot;, con il nome dell&apos;autore, e le sostituiremo con le nostre.</p>}
              </div>
              {media.length > 0 && (
                <div>
                  <h3 className="t-label">Immagini dei luoghi pubblicate</h3>
                  <ul className="mt-3 border-b-2 border-[var(--c-ink)]">
                    {media.map((m) => (
                      <li key={m.id} className="grid gap-1 border-t-2 border-[var(--c-ink)] py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
                        <span className="font-bold">{m.kind} · {m.page}</span>
                        <span>{m.text}{m.credit && <> · <a href={m.credit.url} target="_blank" rel="noopener noreferrer" className="underline">{m.credit.author} / Pexels</a></>}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
          <ul className="mt-6 grid gap-6 lg:grid-cols-2">
            {ITEMS.map((i, n) => (
              <li key={i.h} className={`cut ${["cut-orange", "cut-green"][n]}`}>
                <h2 className="t-head">{i.h}</h2>
                <p className="t-body mt-4">{i.t}</p>
              </li>
            ))}
          </ul>
        </Wrap>
      </Room>
    </>
  );
}
