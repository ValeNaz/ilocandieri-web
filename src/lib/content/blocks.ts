/**
 * Page block system: block types, zod schemas for `page_blocks.data`, and the field specs that drive the
 * generic admin editor. PURE module (no DB, no server-only imports) so seeds and unit tests can use it.
 */
import { z } from "zod";
import { paths } from "@/lib/paths";

// ---------- CTA / links ----------
const INTERNAL_PATHS: ReadonlySet<string> = new Set((Object.values(paths) as unknown[]).filter((v): v is string => typeof v === "string" && v.startsWith("/")));
const DYNAMIC_INTERNAL = /^\/(eventi|news)\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Internal page links for the CTA picker (labels in Italian). */
export const INTERNAL_LINK_OPTIONS: { value: string; label: string }[] = [
  { value: paths.home, label: "Home" },
  { value: paths.about, label: "Chi siamo" },
  { value: paths.shop, label: "Shop ABES (pagina del sito)" },
  { value: paths.events, label: "Eventi" },
  { value: paths.news, label: "News" },
  { value: paths.careers, label: "Lavora con noi" },
  { value: paths.contacts, label: "Contatti" },
  { value: paths.privacy, label: "Privacy" },
  { value: paths.cookies, label: "Cookie Policy" },
  { value: `${paths.home}#luoghi`, label: "Home, sezione luoghi" },
];

/**
 * A link is accepted when it is: an internal site path (known pages, or /eventi|/news/<slug>) with an
 * optional #anchor; an https:// URL; mailto:; or tel:. Anything else (javascript:, http:, //host...) is refused.
 */
export function isSafeHref(raw: string): boolean {
  const href = raw.trim();
  if (!href || href.length > 500 || /[\s<>"'\\]/.test(href)) return false;
  if (href.startsWith("/")) {
    if (href.startsWith("//")) return false;
    const [pathname, anchor, ...rest] = href.split("#");
    if (rest.length) return false;
    if (anchor !== undefined && !/^[a-z0-9_-]*$/i.test(anchor)) return false;
    return INTERNAL_PATHS.has(pathname!) || DYNAMIC_INTERNAL.test(pathname!);
  }
  if (/^mailto:/i.test(href)) return /^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/i.test(href);
  if (/^tel:/i.test(href)) return /^tel:\+?[0-9]{5,20}$/i.test(href);
  try {
    const u = new URL(href);
    return u.protocol === "https:" && u.hostname.includes(".") && !u.username && !u.password;
  } catch {
    return false;
  }
}

export const ctaSchema = z.object({
  label: z.string().trim().min(1, "Scrivi il testo del pulsante.").max(60, "Massimo 60 caratteri."),
  href: z.string().trim().refine(isSafeHref, "Indirizzo non valido: scegli una pagina del sito oppure un indirizzo https://, mailto: o tel:."),
});
export type Cta = z.infer<typeof ctaSchema>;
const optionalCta = ctaSchema.nullable().default(null);

// ---------- primitives ----------
const text = (max: number) => z.string().trim().max(max, `Massimo ${max} caratteri.`).default("");
const reqText = (max: number) => z.string().trim().min(1, "Campo obbligatorio.").max(max, `Massimo ${max} caratteri.`);
const mediaRef = z.string().trim().max(40).nullish().transform((v) => v || null);

const base = {
  /** Stable machine name of the block inside its page (anchor id, lookup by other modules). */
  slot: z.string().regex(/^[a-z0-9_-]{1,40}$/).optional(),
  /** Internal note for editors (shown only in the admin). */
  adminNote: z.string().trim().max(800).optional(),
};

const item = z.object({ title: reqText(100), text: text(500) });
const imageItem = z.object({ title: reqText(100), text: text(600), imageId: mediaRef });

// ---------- block schemas ----------
export const blockSchemas = {
  hero: z.object({
    ...base,
    eyebrow: text(120),
    title: reqText(200),
    text: text(700),
    primaryCta: optionalCta,
    secondaryCta: optionalCta,
    imageId: mediaRef,
    size: z.enum(["large", "standard"]).default("standard"),
  }),
  intro: z.object({
    ...base,
    eyebrow: text(120),
    title: reqText(200),
    text: text(1600),
    cta: optionalCta,
    imageId: mediaRef,
    tone: z.enum(["paper", "sage"]).default("paper"),
  }),
  feature: z.object({
    ...base,
    eyebrow: text(120),
    title: reqText(200),
    text: text(3000),
    imageId: mediaRef,
    imageSide: z.enum(["left", "right"]).default("right"),
    items: z.array(imageItem).max(4).default([]),
    cta: optionalCta,
    tone: z.enum(["paper", "deep"]).default("paper"),
  }),
  pillars: z.object({
    ...base,
    eyebrow: text(120),
    title: reqText(200),
    intro: text(600),
    items: z.array(item).min(1, "Aggiungi almeno un elemento.").max(8),
  }),
  values: z.object({
    ...base,
    eyebrow: text(120),
    title: reqText(200),
    items: z.array(item).min(1, "Aggiungi almeno un elemento.").max(8),
  }),
  places: z.object({
    ...base,
    eyebrow: text(120),
    title: reqText(200),
    text: text(900),
    items: z.array(imageItem).min(1, "Aggiungi almeno un luogo.").max(4),
    cta: optionalCta,
  }),
  abes_showcase: z.object({
    ...base,
    eyebrow: text(120),
    title: reqText(200),
    text: text(900),
    ctaLabel: reqText(60),
    cardCtaLabel: reqText(60),
    limit: z.coerce.number().int().min(1, "Minimo 1.").max(12, "Massimo 12.").default(6),
    source: z.enum(["home", "shop"]).default("home"),
  }),
  events_highlight: z.object({
    ...base,
    eyebrow: text(120),
    title: reqText(200),
    text: text(900),
    cta: optionalCta,
    limit: z.coerce.number().int().min(1, "Minimo 1.").max(6, "Massimo 6.").default(3),
    emptyMessage: text(300),
  }),
  news_highlight: z.object({
    ...base,
    eyebrow: text(120),
    title: reqText(200),
    text: text(900),
    cta: optionalCta,
    limit: z.coerce.number().int().min(1, "Minimo 1.").max(6, "Massimo 6.").default(3),
    emptyMessage: text(300),
  }),
  /** Compact section header (used by list pages: "I prossimi appuntamenti", ...). */
  section_heading: z.object({
    ...base,
    eyebrow: text(120),
    title: reqText(200),
    text: text(900),
  }),
  cta: z.object({
    ...base,
    title: reqText(200),
    text: text(900),
    primaryCta: optionalCta,
    secondaryCta: optionalCta,
  }),
  rich_text: z.object({
    ...base,
    eyebrow: text(120),
    title: reqText(200),
    /** Simple HTML (sanitized on save and on output). May contain {{org.name}} style tokens. */
    html: z.string().trim().max(60000, "Testo troppo lungo.").default(""),
    /** Shows a visible "draft, to be verified" notice until the owner turns it off. */
    draftNotice: z.boolean().default(false),
  }),
  contact: z.object({
    ...base,
    eyebrow: text(120),
    title: reqText(200),
    text: text(900),
    formTitle: reqText(120).default("Scrivici un messaggio"),
  }),
  /** System message / microcopy used by a module (never rendered as a section). */
  message: z.object({
    ...base,
    text: reqText(600),
    buttonLabel: text(60),
  }),
} as const;

export type BlockType = keyof typeof blockSchemas;
export const BLOCK_TYPES = Object.keys(blockSchemas) as BlockType[];
export type BlockDataOf<T extends BlockType> = z.infer<(typeof blockSchemas)[T]>;
export type BlockData = { [T in BlockType]: BlockDataOf<T> }[BlockType];

export function isBlockType(v: string): v is BlockType {
  return Object.prototype.hasOwnProperty.call(blockSchemas, v);
}

export type ParsedBlock = {
  [T in BlockType]: { id: string; type: T; position: number; visible: boolean; data: BlockDataOf<T> };
}[BlockType];

/** Validate raw JSON for a block type. */
export function parseBlockData<T extends BlockType>(type: T, raw: unknown) {
  return blockSchemas[type].safeParse(raw);
}

// ---------- admin field specs ----------
export type FieldSpec =
  | { kind: "text" | "textarea" | "html"; name: string; label: string; hint?: string; required?: boolean; rows?: number }
  | { kind: "cta"; name: string; label: string; hint?: string }
  | { kind: "media"; name: string; label: string; hint?: string }
  | { kind: "number"; name: string; label: string; hint?: string; min: number; max: number }
  | { kind: "select"; name: string; label: string; hint?: string; options: [string, string][] }
  | { kind: "checkbox"; name: string; label: string; hint?: string }
  | { kind: "items"; name: string; label: string; itemLabel: string; min: number; max: number; fields: Exclude<FieldSpec, { kind: "items" }>[] };

const eyebrow: FieldSpec = { kind: "text", name: "eyebrow", label: "Sopratitolo", hint: "Piccola scritta sopra il titolo (facoltativa)." };
const title = (label = "Titolo"): FieldSpec => ({ kind: "text", name: "title", label, required: true });
const body = (label = "Testo", hint?: string): FieldSpec => ({ kind: "textarea", name: "text", label, hint, rows: 4 });
const image = (hint = "Se non scegli un'immagine viene mostrato un disegno decorativo."): FieldSpec => ({ kind: "media", name: "imageId", label: "Immagine", hint });
const itemFields: Exclude<FieldSpec, { kind: "items" }>[] = [
  { kind: "text", name: "title", label: "Titolo", required: true },
  { kind: "textarea", name: "text", label: "Testo", rows: 3 },
];
const imageItemFields: Exclude<FieldSpec, { kind: "items" }>[] = [...itemFields, { kind: "media", name: "imageId", label: "Immagine" }];

export type BlockDef = { label: string; description: string; fields: FieldSpec[] };

export const BLOCK_DEFS: Record<BlockType, BlockDef> = {
  hero: {
    label: "Apertura della pagina",
    description: "Titolo principale, testo e pulsanti.",
    fields: [eyebrow, title("Titolo principale"), body(), { kind: "cta", name: "primaryCta", label: "Pulsante principale" }, { kind: "cta", name: "secondaryCta", label: "Secondo pulsante" }, image(),
      { kind: "select", name: "size", label: "Dimensione", options: [["standard", "Normale"], ["large", "Grande (Home)"]] }],
  },
  intro: {
    label: "Testo introduttivo",
    description: "Titolo, testo, immagine e pulsante.",
    fields: [eyebrow, title(), body("Testo"), { kind: "cta", name: "cta", label: "Pulsante" }, image(), { kind: "select", name: "tone", label: "Sfondo", options: [["paper", "Chiaro"], ["sage", "Verde chiaro"]] }],
  },
  feature: {
    label: "Sezione con testo e immagine",
    description: "Testo a paragrafi, immagine, eventuali schede e pulsante.",
    fields: [eyebrow, title(), body("Testo", "Separa i paragrafi con una riga vuota."), image(),
      { kind: "select", name: "imageSide", label: "Posizione immagine", options: [["right", "A destra"], ["left", "A sinistra"]] },
      { kind: "items", name: "items", label: "Schede", itemLabel: "Scheda", min: 0, max: 4, fields: imageItemFields },
      { kind: "cta", name: "cta", label: "Pulsante" },
      { kind: "select", name: "tone", label: "Sfondo", options: [["paper", "Chiaro"], ["deep", "Beige"]] }],
  },
  pillars: {
    label: "Ambiti di intervento",
    description: "Elenco di schede con titolo e testo.",
    fields: [eyebrow, title(), { kind: "textarea", name: "intro", label: "Introduzione", rows: 3 }, { kind: "items", name: "items", label: "Ambiti", itemLabel: "Ambito", min: 1, max: 8, fields: itemFields }],
  },
  values: {
    label: "Valori",
    description: "Elenco di valori con titolo e testo.",
    fields: [eyebrow, title(), { kind: "items", name: "items", label: "Valori", itemLabel: "Valore", min: 1, max: 8, fields: itemFields }],
  },
  places: {
    label: "Luoghi e progetti",
    description: "Schede con immagine dei luoghi.",
    fields: [eyebrow, title(), body(), { kind: "items", name: "items", label: "Luoghi", itemLabel: "Luogo", min: 1, max: 4, fields: imageItemFields }, { kind: "cta", name: "cta", label: "Pulsante" }],
  },
  abes_showcase: {
    label: "Vetrina prodotti ABES",
    description: "Testi della vetrina. I prodotti si scelgono in «Prodotti ABES».",
    fields: [eyebrow, title(), body(), { kind: "text", name: "ctaLabel", label: "Testo del pulsante verso lo shop ABES", required: true }, { kind: "text", name: "cardCtaLabel", label: "Testo del pulsante su ogni prodotto", required: true },
      { kind: "number", name: "limit", label: "Numero massimo di prodotti", min: 1, max: 12, hint: "Consigliato da 4 a 8." }],
  },
  events_highlight: {
    label: "Eventi in evidenza",
    description: "Testi della sezione. Gli eventi si gestiscono in «Eventi».",
    fields: [eyebrow, title(), body(), { kind: "cta", name: "cta", label: "Pulsante" }, { kind: "number", name: "limit", label: "Numero di eventi mostrati", min: 1, max: 6 },
      { kind: "text", name: "emptyMessage", label: "Messaggio se non ci sono eventi", hint: "Se lasci vuoto, la sezione non compare finché non ci sono eventi." }],
  },
  news_highlight: {
    label: "Ultime news",
    description: "Testi della sezione. Gli articoli si gestiscono in «News».",
    fields: [eyebrow, title(), body(), { kind: "cta", name: "cta", label: "Pulsante" }, { kind: "number", name: "limit", label: "Numero di news mostrate", min: 1, max: 6 },
      { kind: "text", name: "emptyMessage", label: "Messaggio se non ci sono news", hint: "Se lasci vuoto, la sezione non compare finché non ci sono news." }],
  },
  section_heading: {
    label: "Intestazione di sezione",
    description: "Titolo e breve testo che introducono un elenco.",
    fields: [eyebrow, title(), body()],
  },
  cta: {
    label: "Invito all'azione",
    description: "Riquadro con titolo, testo e due pulsanti.",
    fields: [title(), body(), { kind: "cta", name: "primaryCta", label: "Pulsante principale" }, { kind: "cta", name: "secondaryCta", label: "Secondo pulsante" }],
  },
  rich_text: {
    label: "Testo esteso",
    description: "Testo formattato (titoli, elenchi, link).",
    fields: [eyebrow, title(), { kind: "html", name: "html", label: "Testo", rows: 22, hint: "Puoi usare i segnaposto {{org.name}}, {{org.address}}, {{org.email}}, {{org.phone}}, {{org.vatId}}: vengono sostituiti con i dati di Impostazioni." },
      { kind: "checkbox", name: "draftNotice", label: "Mostra l'avviso «testo in bozza, da verificare» ai visitatori", hint: "Disattivalo quando il testo è stato verificato dal titolare/consulente." }],
  },
  contact: {
    label: "Contatti e modulo",
    description: "Titolo e testo. Recapiti e destinatari si modificano in Impostazioni.",
    fields: [eyebrow, title("Titolo principale"), body(), { kind: "text", name: "formTitle", label: "Titolo del modulo", required: true }],
  },
  message: {
    label: "Messaggio di sistema",
    description: "Testo usato in situazioni particolari (non è una sezione della pagina).",
    fields: [{ kind: "textarea", name: "text", label: "Testo", rows: 3, required: true }, { kind: "text", name: "buttonLabel", label: "Testo del pulsante (se previsto)" }],
  },
};

/** Readable names of well-known slots (admin). */
export const SLOT_LABELS: Record<string, string> = {
  hero: "Apertura",
  luoghi: "Luoghi",
  upcoming: "Sezione eventi futuri",
  past: "Sezione eventi passati",
  list: "Introduzione dell'elenco",
  collab: "Collaborazioni",
  form: "Presentazione del modulo",
  confirmation: "Messaggio di conferma",
  no_openings: "Messaggio: nessuna posizione aperta",
  empty: "Messaggio: nessun contenuto",
  read_label: "Testo pulsante «leggi»",
  all_label: "Testo pulsante «tutte»",
  form_submit: "Testo pulsante di invio",
  state_open: "Evento: iscrizione aperta",
  state_limited: "Evento: posti limitati",
  state_reserved: "Evento: riservato",
  state_approval: "Evento: su approvazione",
  state_confirmed: "Evento: iscrizione confermata",
  state_pending: "Evento: richiesta in attesa",
  state_full: "Evento: posti esauriti",
  state_closed: "Evento: iscrizioni chiuse",
  state_past: "Evento: concluso",
};

export const PAGE_KEYS = ["home", "chi-siamo", "shop", "eventi", "news", "lavora-con-noi", "contatti", "privacy", "cookie"] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

export function isPageKey(v: string): v is PageKey {
  return (PAGE_KEYS as readonly string[]).includes(v);
}

/** Public URL of each page (for "Vedi pagina" links). */
export const PAGE_URLS: Record<PageKey, string> = {
  home: paths.home,
  "chi-siamo": paths.about,
  shop: paths.shop,
  eventi: paths.events,
  news: paths.news,
  "lavora-con-noi": paths.careers,
  contatti: paths.contacts,
  privacy: paths.privacy,
  cookie: paths.cookies,
};
