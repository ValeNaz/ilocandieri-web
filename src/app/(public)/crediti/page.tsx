import type { Metadata } from "next";
import { PHOTOS, VIDEOS } from "@/components/public/media/stock";
import { Container } from "@/components/ui";

export const metadata: Metadata = { title: "Crediti foto e video", robots: { index: false } };

/** Credits for the temporary stock media (required by the Creative Commons licences of the photos). */
export default function Page() {
  const link = "text-terracotta-deep underline underline-offset-4";
  return (
    <Container className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="stamp mb-4">Crediti</p>
        <h1 className="text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] tracking-[-0.03em]">Foto e video</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          Le immagini del sito sono provvisorie, in attesa delle foto e dei video della cooperativa. Le foto dei prodotti sono di ABES.
        </p>
        <h2 className="mt-12 text-2xl">Foto (Wikimedia Commons)</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {Object.values(PHOTOS).map((p) => (
            <li key={p.src} className="py-4">
              <p className="font-medium">{p.alt}</p>
              <p className="mt-1 text-sm text-ink-soft">
                Foto di {p.credit} · licenza {p.license} · <a className={link} href={p.source} target="_blank" rel="noopener noreferrer">fonte<span className="sr-only"> (si apre in una nuova scheda)</span></a>
              </p>
            </li>
          ))}
        </ul>
        <h2 className="mt-12 text-2xl">Video (Mixkit, licenza gratuita)</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {Object.values(VIDEOS).map((v) => (
            <li key={v.src} className="py-4">
              <p className="font-medium">{v.alt}</p>
              <p className="mt-1 text-sm text-ink-soft">
                Video {v.credit} · <a className={link} href={v.source} target="_blank" rel="noopener noreferrer">fonte<span className="sr-only"> (si apre in una nuova scheda)</span></a>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}
