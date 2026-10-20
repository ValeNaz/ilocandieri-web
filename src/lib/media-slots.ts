import { z } from "zod";

/**
 * Spaces for REAL photos and videos of the cooperative, each tied to one section of the site.
 * A slot shows (in order): the media assigned in the admin, else a file `public/reali/<id>.(webp|jpg|jpeg|png|mp4)`
 * (videos may add `<id>-poster.jpg`), else nothing in production (an annotated placeholder in development).
 * `need` is the shot brief for the photographer (also listed in docs/FOTO_DA_FORNIRE.md). Never stock, never staged pathos.
 */
export type MediaSlotKind = "photo" | "video";
export type MediaSlot = { id: string; page: string; section: string; kind: MediaSlotKind; aspect: "16/9" | "4/3" | "3/4" | "1/1" | "21/9"; alt: string; need: string };

const MINORS = "Nessun volto riconoscibile di minori senza liberatoria; meglio di spalle, da lontano o solo mani al lavoro.";

export const MEDIA_SLOTS = [
  { id: "home-giardino", page: "/", section: "Luoghi: Giardino delle Arance", kind: "photo", aspect: "4/3", alt: "L'agrumeto del Giardino delle Arance con il casolare sullo sfondo", need: "Agrumeto in luce piena, alberi carichi, casolare visibile in fondo. Orizzontale." },
  { id: "home-campo", page: "/", section: "Luoghi: Campo Unità d'Italia", kind: "photo", aspect: "4/3", alt: "Il Campo Polivalente Unità d'Italia durante un allenamento", need: `Il campo con un'attività in corso, ripreso da bordo campo. ${MINORS}` },
  { id: "home-video", page: "/", section: "Cosa facciamo (chiusura)", kind: "video", aspect: "16/9", alt: "Una giornata ai luoghi de I Locandieri", need: "Video 20-40 s, senza audio parlato: apertura del cancello, orto, raccolta arance, campo, laboratorio. Riprese ferme, luce naturale." },
  { id: "chi-siamo-squadra", page: "/chi-siamo", section: "Missione", kind: "photo", aspect: "16/9", alt: "Soci e operatori de I Locandieri davanti al casolare", need: "Foto di gruppo di soci e operatori adulti (con liberatoria), naturale, all'aperto." },
  { id: "chi-siamo-lavoro", page: "/chi-siamo", section: "ABES", kind: "photo", aspect: "4/3", alt: "Lavoro nell'orto biologico del Giardino delle Arance", need: "Persone al lavoro nell'orto (adulti), gesto concreto: piantare, raccogliere, sistemare cassette." },
  { id: "accoglienza-casa", page: "/accoglienza", section: "La casa", kind: "photo", aspect: "4/3", alt: "La tavola apparecchiata nella casa dell'accoglienza", need: `Spazi della casa: tavola apparecchiata, cucina, aula. Nessun ospite riconoscibile. ${MINORS}` },
  { id: "giardino-casolare", page: "/luoghi/giardino-delle-arance", section: "Il casolare", kind: "photo", aspect: "4/3", alt: "Il casolare di fine Settecento del Giardino delle Arance", need: "Facciata del casolare ristrutturato, luce radente del mattino." },
  { id: "giardino-agrumeto", page: "/luoghi/giardino-delle-arance", section: "I tre ettari", kind: "photo", aspect: "21/9", alt: "L'agrumeto recuperato del Giardino delle Arance", need: "Panoramica dell'agrumeto (anche da drone, se possibile)." },
  { id: "giardino-laboratorio", page: "/luoghi/giardino-delle-arance", section: "Il laboratorio", kind: "photo", aspect: "4/3", alt: "Il laboratorio di trasformazione agroalimentare", need: "Il laboratorio in attività: pentole, barattoli in preparazione, piani di lavoro." },
  { id: "giardino-video", page: "/luoghi/giardino-delle-arance", section: "Apertura o chiusura", kind: "video", aspect: "16/9", alt: "Il Giardino delle Arance in movimento", need: "Video 15-30 s: camminata tra gli agrumi, raccolta, orto. Senza audio parlato." },
  { id: "campo-panoramica", page: "/luoghi/campo-polivalente", section: "Il campo", kind: "photo", aspect: "21/9", alt: "Il Campo Polivalente Unità d'Italia a Castelvetrano", need: "Il campo intero, vuoto o con attività lontana, cielo pulito." },
  { id: "campo-attivita", page: "/luoghi/campo-polivalente", section: "Pallavolo / primi passi", kind: "photo", aspect: "4/3", alt: "Un allenamento di pallavolo al Campo Unità d'Italia", need: `Allenamento di pallavolo o avviamento allo sport. ${MINORS}` },
  { id: "storia-prima", page: "/storia", section: "Il casolare chiuso", kind: "photo", aspect: "4/3", alt: "Il casolare prima del recupero", need: "Foto d'archivio del bene prima del recupero (se esiste)." },
  { id: "storia-dopo", page: "/storia", section: "Il giardino", kind: "photo", aspect: "4/3", alt: "Il casolare e l'agrumeto oggi", need: "Stessa inquadratura di storia-prima, oggi." },
  { id: "tradizione-grano", page: "/tradizione", section: "Tumminia", kind: "photo", aspect: "4/3", alt: "Grano Tumminia coltivato da ABES", need: "Campo di grano Tumminia (spighe mature o mietitura)." },
  { id: "tradizione-pane", page: "/tradizione", section: "Pane nero", kind: "photo", aspect: "4/3", alt: "Pane nero di Castelvetrano con farina di Tumminia", need: "Pagnotta di pane nero tagliata, su tavolo di legno, luce naturale." },
  { id: "abes-raccolta", page: "/abes", section: "Raccolta", kind: "photo", aspect: "4/3", alt: "Raccolta nei campi ABES", need: "Raccolta con cassette piene (arance, ortaggi), persone adulte al lavoro." },
  { id: "abes-video", page: "/abes", section: "Dal seme al barattolo", kind: "video", aspect: "16/9", alt: "Dal campo al barattolo ABES", need: "Video 20-40 s: campo, raccolta, laboratorio, barattoli etichettati." },
  { id: "lavora-squadra", page: "/lavora-con-noi", section: "Collaborazioni", kind: "photo", aspect: "16/9", alt: "La squadra de I Locandieri al lavoro", need: "Operatori adulti al lavoro in contesti diversi (orto, laboratorio, ufficio, campo)." },
] as const satisfies readonly MediaSlot[];

export type MediaSlotId = (typeof MEDIA_SLOTS)[number]["id"];
export const mediaSlot = (id: MediaSlotId): MediaSlot => MEDIA_SLOTS.find((s) => s.id === id)!;

/* ------------------------------------------------------------------------------------------------
 * Admin assignments (setting `mediaSlots`) and source resolution. Pure: no fs, no db (tested in
 * tests/unit/media-slots.test.ts). Server-side lookups live in src/components/public/real/resolve.ts.
 * ---------------------------------------------------------------------------------------------- */
export const MEDIA_SLOT_IDS: readonly MediaSlotId[] = MEDIA_SLOTS.map((s) => s.id);
export const isMediaSlotId = (v: unknown): v is MediaSlotId => typeof v === "string" && (MEDIA_SLOT_IDS as readonly string[]).includes(v);

/** Human labels for the admin grouping (falls back to the path). */
export const MEDIA_SLOT_PAGE_LABELS: Record<string, string> = {
  "/": "Home",
  "/chi-siamo": "Chi siamo",
  "/accoglienza": "Accoglienza",
  "/luoghi/giardino-delle-arance": "Giardino delle Arance",
  "/luoghi/campo-polivalente": "Campo Polivalente Unità d'Italia",
  "/storia": "Storia",
  "/tradizione": "Tradizione",
  "/abes": "ABES",
  "/lavora-con-noi": "Lavora con noi",
};
export const mediaSlotPageLabel = (page: string) => MEDIA_SLOT_PAGE_LABELS[page] ?? page;

/** Slots grouped by page, in registry order. */
export function mediaSlotsByPage(): { page: string; label: string; slots: MediaSlot[] }[] {
  const groups = new Map<string, MediaSlot[]>();
  for (const s of MEDIA_SLOTS as readonly MediaSlot[]) groups.set(s.page, [...(groups.get(s.page) ?? []), s]);
  return [...groups].map(([page, slots]) => ({ page, label: mediaSlotPageLabel(page), slots }));
}

/** What the admin stored for one slot. `mediaId` = library image (photo, or poster for a video slot). */
export type MediaSlotEntry = { mediaId: string | null; alt: string; caption: string; videoUrl: string };
export type MediaSlotsSettings = Partial<Record<MediaSlotId, MediaSlotEntry>>;

export const VIDEO_EXT_RE = /\.(mp4|webm)$/i;
const LOCAL_VIDEO_RE = /^\/reali\/[A-Za-z0-9][A-Za-z0-9._-]{0,100}\.(mp4|webm)$/i;

/** A video address the site may play: https (no credentials) ending in .mp4/.webm, or a file in /reali/. */
export function isAllowedVideoUrl(v: string): boolean {
  if (v.startsWith("/")) return LOCAL_VIDEO_RE.test(v) && !v.includes("..");
  try {
    const u = new URL(v);
    return u.protocol === "https:" && !u.username && !u.password && u.hostname.includes(".") && VIDEO_EXT_RE.test(u.pathname);
  } catch {
    return false;
  }
}

const str = (max: number, msg: string) => z.preprocess((v) => (typeof v === "string" ? v.trim() : ""), z.string().max(max, msg));

/** One slot entry, from a form or from the stored JSON. */
export const mediaSlotEntrySchema = z.object({
  mediaId: str(40, "Immagine non valida.").refine((v) => /^[A-Za-z0-9_-]*$/.test(v), "Immagine non valida.").transform((v) => v || null),
  alt: str(200, "Massimo 200 caratteri.").refine((v) => v === "" || v.length >= 3, "Almeno 3 caratteri (o lascia vuoto per usare la descrizione predefinita)."),
  caption: str(160, "Massimo 160 caratteri."),
  videoUrl: str(500, "Indirizzo troppo lungo.").refine((v) => v === "" || isAllowedVideoUrl(v), "Inserisci un indirizzo https:// che finisce con .mp4 o .webm (oppure /reali/nome-file.mp4)."),
});

export type SlotEntryResult = { ok: true; entry: MediaSlotEntry | null } | { ok: false; fieldErrors: Record<string, string> };

/** Validate an entry for a given slot. `entry: null` = nothing left to store (slot cleared). */
export function validateSlotEntry(slot: MediaSlot, input: Record<string, unknown>): SlotEntryResult {
  const parsed = mediaSlotEntrySchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0] ?? "_")] ??= i.message;
    return { ok: false, fieldErrors };
  }
  const e = parsed.data;
  if (slot.kind === "photo" && e.videoUrl) return { ok: false, fieldErrors: { videoUrl: "Questo spazio accetta solo una foto." } };
  if (!e.mediaId && !e.videoUrl && !e.alt && !e.caption) return { ok: true, entry: null };
  return { ok: true, entry: e };
}

/** Read the stored setting defensively: unknown ids and invalid entries are dropped. */
export function parseMediaSlotsSetting(raw: unknown): MediaSlotsSettings {
  const out: MediaSlotsSettings = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!isMediaSlotId(id) || !value || typeof value !== "object") continue;
    const r = validateSlotEntry(mediaSlot(id), value as Record<string, unknown>);
    if (r.ok && r.entry) out[id] = r.entry;
  }
  return out;
}

export type LibraryImage = { url: string; alt: string; width: number | null; height: number | null; credit?: string | null };
/** Public URLs of files found in public/reali for a slot. */
export type SlotFiles = { photo?: string; video?: string; poster?: string; photoSize?: { width: number; height: number } | null };

/** A provisional stock photo standing in for the real one (src/content/stockPhotos.ts). */
export type StockFile = { src: string; small?: string; alt: string; author: string; url: string; width?: number; height?: number };

export type ResolvedMedia =
  | { origin: "admin" | "file"; type: "photo"; src: string; alt: string; caption?: string; width?: number; height?: number }
  | { origin: "stock"; type: "photo"; src: string; small?: string; alt: string; credit: { author: string; url: string }; width?: number; height?: number }
  | { origin: "admin" | "file"; type: "video"; src: string; poster?: string; alt: string; caption?: string }
  | { origin: "placeholder" };

/**
 * Order: admin assignment -> file in public/reali -> provisional stock photo -> placeholder (only if `showPlaceholder`) -> null.
 * Admin alt/caption also apply to a file found on disk. `image` = the library row of `entry.mediaId` (null if deleted).
 */
export function resolveMediaSource(args: { slot: MediaSlot; entry?: MediaSlotEntry | null; image?: LibraryImage | null; files?: SlotFiles; stock?: StockFile | null; caption?: string; showPlaceholder?: boolean }): ResolvedMedia | null {
  const { slot, entry, image, files = {}, stock, showPlaceholder = false } = args;
  const alt = entry?.alt || slot.alt;
  const caption = entry?.caption || args.caption || undefined;
  const size = (w: number | null | undefined, h: number | null | undefined) => (w && h ? { width: w, height: h } : {});
  if (slot.kind === "video" && entry?.videoUrl) return { origin: "admin", type: "video", src: entry.videoUrl, poster: image?.url ?? files.poster, alt, caption };
  if (entry?.mediaId && image) return { origin: "admin", type: "photo", src: image.url, alt, caption, ...size(image.width, image.height) };
  if (slot.kind === "video" && files.video) return { origin: "file", type: "video", src: files.video, poster: files.poster, alt, caption };
  if (files.photo) return { origin: "file", type: "photo", src: files.photo, alt, caption, ...size(files.photoSize?.width, files.photoSize?.height) };
  if (stock && slot.kind === "photo") return { origin: "stock", type: "photo", src: stock.src, small: stock.small, alt: stock.alt, credit: { author: stock.author, url: stock.url }, ...size(stock.width, stock.height) };
  return showPlaceholder ? { origin: "placeholder" } : null;
}
