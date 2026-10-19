/**
 * TEMPORARY stock media, used until the cooperative supplies its own photos and videos.
 * Photos: Wikimedia Commons (free licences, credited on /crediti). Videos: Mixkit (Mixkit Free License, no attribution
 * required, credited anyway). Anything the admin uploads always wins over these.
 */
export type StockPhoto = { src: string; w: number; h: number; alt: string; credit: string; license: string; source: string };
export type StockVideo = { src: string; poster: string; alt: string; credit: string; source: string };

export const PHOTOS = {
  belice: { src: "/foto/stock/belice-uliveto.jpg", w: 2400, h: 1606, alt: "La valle del Belice: uliveti, vigneti e il mare all'orizzonte", credit: "Thomas", license: "CC BY-SA 2.0", source: "https://commons.wikimedia.org/wiki/File:Belice_Valley.jpg" },
  campagna: { src: "/foto/stock/campagna-sicilia.jpg", w: 2400, h: 1272, alt: "Campagna siciliana con una roccia e una collina verde", credit: "Julian Lupyan", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:Sicilian_Countryside.jpg" },
  selinunte: { src: "/foto/stock/selinunte.jpg", w: 2400, h: 1800, alt: "Il tempio di Selinunte, a Castelvetrano", credit: "Margie81", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Castelvetrano_-_Selinunte_-_2025-09-05_16-35-32_001.jpg" },
  corso: { src: "/foto/stock/castelvetrano-corso.jpg", w: 2400, h: 1600, alt: "Il corso di Castelvetrano la sera", credit: "Mboesch", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Castelvetrano-corso.JPG" },
  casale: { src: "/foto/stock/campagna-avola.jpg", w: 2400, h: 1600, alt: "Un vecchio casale di campagna oltre un cancello aperto", credit: "DavideGorla", license: "CC BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Sicily_Countryside_(Avola).jpg" },
} satisfies Record<string, StockPhoto>;

const mixkit = (slug: string) => `https://mixkit.co/free-stock-video/${slug}/`;
export const VIDEOS = {
  limoni: { src: "/video/limoni.mp4", poster: "/video/limoni.jpg", alt: "Rami di un albero di limoni mossi dal vento", credit: "Mixkit", source: mixkit("closeup-of-a-lemon-tree-966") },
  olive: { src: "/video/olive.mp4", poster: "/video/olive.jpg", alt: "Olive verdi su un ramo", credit: "Mixkit", source: mixkit("olives-growing-in-a-tree-22195") },
  granoSacco: { src: "/video/grano-sacco.mp4", poster: "/video/grano-sacco.jpg", alt: "Mani che affondano nel grano di un sacco di juta", credit: "Mixkit", source: mixkit("hands-full-of-grain-in-a-sack-48769") },
  granoTramonto: { src: "/video/grano-tramonto.mp4", poster: "/video/grano-tramonto.jpg", alt: "Una mano sfiora le spighe di grano al tramonto", credit: "Mixkit", source: mixkit("hand-touching-wheat-in-golden-sunset-8864") },
  germoglio: { src: "/video/germoglio.mp4", poster: "/video/germoglio.jpg", alt: "Mani che offrono un germoglio nella terra", credit: "Mixkit", source: mixkit("clasped-hands-holding-a-sprouting-plant-47063") },
  tramonto: { src: "/video/tramonto.mp4", poster: "/video/tramonto.jpg", alt: "Tramonto sulla macchia mediterranea", credit: "Mixkit", source: mixkit("sun-setting-over-a-garden-4205") },
  semina: { src: "/video/semina.mp4", poster: "/video/semina.jpg", alt: "Terra appena seminata nella luce del mattino", credit: "Mixkit", source: mixkit("a-person-sowing-a-seed-2851") },
  luce: { src: "/video/luce-foglie.mp4", poster: "/video/luce-foglie.jpg", alt: "Il sole che filtra tra le foglie", credit: "Mixkit", source: mixkit("sunlight-crossing-the-branches-of-trees-1709") },
  pallone: { src: "/video/pallone.mp4", poster: "/video/pallone.jpg", alt: "Ragazzi che arrivano al campo con un pallone", credit: "Mixkit", source: mixkit("men-coming-to-play-soccer-football-4567") },
} satisfies Record<string, StockVideo>;

export type PhotoKey = keyof typeof PHOTOS;
export type VideoKey = keyof typeof VIDEOS;
