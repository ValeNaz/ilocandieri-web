/**
 * PROVISIONAL stock photos (Pexels licence: free use, attribution appreciated), one per photo slot of src/lib/media-slots.ts.
 * They show places and people LIKE ours, not ours: the alt says what they really show and the frame credits the author.
 * Files: public/foto/provvisorie/<slot>.webp (+ <slot>-1000.webp), fetched by scripts/fetch-stock-photos.mjs; video slots:
 * <slot>.mp4 + <slot>-poster.jpg (home-video: Pexels 14086016, 720p 25fps, no audio, encoded with ffmpeg).
 * A real photo (admin "Foto e video reali" or public/reali/<slot>.*) always wins; delete the entry here once it is in.
 */
export type StockPhoto = { alt: string; author: string; url: string };

export const stockPhotos: Record<string, StockPhoto> = {
  "home-video": { alt: "Un uomo raccoglie arance da un albero con un cesto, in un agrumeto", author: "Furio Busignani", url: "https://www.pexels.com/video/14086016/" },
  "home-giardino": { alt: "Rami di un arancio carico di frutti, in controluce al sole", author: "Нурлан", url: "https://www.pexels.com/photo/11606369/" },
  "home-campo": { alt: "Partita di pallavolo all'aperto su un prato", author: "Danny Sanz", url: "https://www.pexels.com/photo/10855503/" },
  "chi-siamo-squadra": { alt: "Gruppo di agricoltori in piedi in un campo", author: "Breno Coelho", url: "https://www.pexels.com/photo/12026165/" },
  "chi-siamo-lavoro": { alt: "Mani con guanti che piantano piantine di lattuga", author: "Greta Hoffman", url: "https://www.pexels.com/photo/7728082/" },
  "storia-prima": { alt: "Casale in pietra abbandonato in campagna", author: "Chris F", url: "https://www.pexels.com/photo/3714192/" },
  "storia-dopo": { alt: "Casali in pietra immersi nel verde in una giornata di sole", author: "Renato Rocca", url: "https://www.pexels.com/photo/9769288/" },
  "accoglienza-casa": { alt: "Tavolo in legno apparecchiato con sedie in vimini", author: "Engin Akyurt", url: "https://www.pexels.com/photo/2092058/" },
  "lavora-squadra": { alt: "Due operatori al lavoro tra le piante di un vivaio", author: "Gustavo Fring", url: "https://www.pexels.com/photo/4920234/" },
  "giardino-casolare": { alt: "Masseria in pietra con pecore al pascolo", author: "Vito Giaccari", url: "https://www.pexels.com/photo/6798463/" },
  "giardino-agrumeto": { alt: "Filari di aranci lungo un sentiero di campagna", author: "Magda Ehlers", url: "https://www.pexels.com/photo/39272521/" },
  "giardino-laboratorio": { alt: "Barattoli di conserve e pomodori su un piano di lavoro", author: "TIVASEE", url: "https://www.pexels.com/photo/33984942/" },
  "campo-panoramica": { alt: "Campo sportivo all'aperto con vista sul mare", author: "Valentin Ivantsov", url: "https://www.pexels.com/photo/34481547/" },
  "campo-attivita": { alt: "Allenamento di pallavolo, giocatrice ripresa di spalle", author: "Pavel Danilyuk", url: "https://www.pexels.com/photo/6203637/" },
  "tradizione-grano": { alt: "Campo di grano maturo sotto un cielo con nuvole", author: "Nikolett Emmert", url: "https://www.pexels.com/photo/9361507/" },
  "tradizione-pane": { alt: "Pane rustico tagliato a fette su un tagliere", author: "Natalia Olivera", url: "https://www.pexels.com/photo/30632207/" },
  "abes-raccolta": { alt: "Raccolta di arance nelle cassette", author: "M1DDL3 M7N", url: "https://www.pexels.com/photo/14766935/" },
};
