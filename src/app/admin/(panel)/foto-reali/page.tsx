import { PageHeader } from "@/components/admin/PageHeader";
import { resolveSlot, getMediaSlotAssignments } from "@/components/public/real/resolve";
import { Badge } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { listMediaOptions } from "@/lib/content/media";
import { MEDIA_SLOTS, mediaSlotsByPage, type MediaSlotId, type ResolvedMedia } from "@/lib/media-slots";
import { adminPaths } from "@/lib/paths";
import { SlotForm } from "./SlotForm";

export const metadata = { title: "Foto e video reali" };

const ORIGIN: Record<string, { text: string; tone: "success" | "olive" | "neutral" }> = {
  admin: { text: "Sul sito: scelta da qui", tone: "success" },
  file: { text: "Sul sito: file caricato dal tecnico", tone: "olive" },
  none: { text: "Vuoto: sul sito non compare", tone: "neutral" },
};

function Preview({ media, aspect }: { media: ResolvedMedia | null; aspect: string }) {
  const box = "relative w-full overflow-hidden rounded-card border border-line bg-paper-deep";
  if (!media || media.origin === "placeholder")
    return <div className={`${box} grid place-items-center border-dashed p-4 text-center text-sm text-ink-soft`} style={{ aspectRatio: aspect }}>Ancora vuoto</div>;
  return (
    <div className={box} style={{ aspectRatio: aspect }}>
      {media.type === "video" ? (
        <video className="absolute inset-0 size-full object-cover" src={media.src} poster={media.poster} muted playsInline controls preload="none" aria-label={media.alt} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- admin preview
        <img className="absolute inset-0 size-full object-cover" src={media.src} alt={media.alt} loading="lazy" />
      )}
    </div>
  );
}

export default async function Page() {
  await requireAdmin();
  const [options, { entries }] = await Promise.all([listMediaOptions(), getMediaSlotAssignments()]);
  const resolved = new Map(await Promise.all(MEDIA_SLOTS.map(async (s) => [s.id, await resolveSlot(s.id, { showPlaceholder: false })] as const)));
  const filled = [...resolved.values()].filter(Boolean).length;
  return (
    <>
      <PageHeader title="Foto e video reali"
        description={<>Ogni pagina del sito ha degli spazi pensati per foto e video veri della cooperativa. Per ognuno trovi cosa riprendere: scegli la foto dalla libreria <a className="font-medium text-terracotta-deep underline" href={adminPaths.media}>Media</a> e premi Salva. Uno spazio vuoto non compare sul sito. Spazi riempiti: {filled} su {MEDIA_SLOTS.length}.</>} />
      <div className="max-w-5xl space-y-12">
        <aside className="rounded-card border border-line bg-card p-5 text-sm">
          <p className="font-medium">Prima di pubblicare</p>
          <p className="mt-1 text-ink-soft">Usa solo foto e video di cui avete i diritti. Per adulti riconoscibili serve la liberatoria; per i minori la liberatoria di chi esercita la responsabilità genitoriale, e comunque meglio di spalle, da lontano o solo le mani. Niente foto di repertorio.</p>
        </aside>
        {mediaSlotsByPage().map((g, gi) => (
          <section key={g.page} aria-labelledby={`g-${gi}`} className="space-y-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
              <h2 id={`g-${gi}`} className="font-display text-2xl font-medium">{g.label}</h2>
              <a href={g.page} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-terracotta-deep underline">Apri la pagina<span className="sr-only"> {g.label} (nuova scheda)</span></a>
            </div>
            {g.slots.map((s) => {
              const media = resolved.get(s.id as MediaSlotId) ?? null;
              const origin = ORIGIN[media && media.origin !== "placeholder" ? media.origin : "none"]!;
              return (
                <article key={s.id} aria-labelledby={`s-${s.id}`} className="grid gap-6 rounded-card border border-line bg-card p-5 shadow-card md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:p-6">
                  <div className="space-y-3">
                    <Preview media={media} aspect={s.aspect} />
                    <Badge tone={origin.tone}>{origin.text}</Badge>
                  </div>
                  <div className="min-w-0 space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{s.kind === "video" ? "Video" : "Foto"} · formato {s.aspect.replace("/", ":")} · {s.id}</p>
                      <h3 id={`s-${s.id}`} className="mt-1 text-lg font-semibold">{s.section}</h3>
                      <p className="mt-2 text-ink-soft"><span className="font-medium text-ink">Cosa riprendere:</span> {s.need}</p>
                    </div>
                    <SlotForm id={s.id} kind={s.kind} defaultAlt={s.alt} entry={entries[s.id as MediaSlotId] ?? null} options={options} />
                  </div>
                </article>
              );
            })}
          </section>
        ))}
      </div>
    </>
  );
}
