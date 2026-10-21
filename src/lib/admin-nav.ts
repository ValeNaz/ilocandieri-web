import type { IconName } from "@/components/admin/icons";
import type { PageKey } from "@/lib/content/blocks";
import { adminPaths } from "@/lib/paths";

/** Live counts shown next to sidebar items (things waiting for someone). */
export type AdminBadges = { registrations: number; applications: number; messages: number; email: number };

export type AdminNavItem = { label: string; href: string; hint: string; icon: IconName; exact?: boolean; badge?: keyof AdminBadges };
export type AdminNavGroup = { title: string; items: AdminNavItem[] };

/** Sidebar structure (plain-language labels for non-technical editors). */
export const adminNav: AdminNavGroup[] = [
  { title: "Panoramica", items: [{ label: "Dashboard", href: adminPaths.dashboard, hint: "Riepilogo di cosa succede", icon: "dashboard", exact: true }] },
  {
    title: "Contenuti del sito",
    items: [
      { label: "Home", href: adminPaths.home, hint: "Testi, immagini e sezioni della home", icon: "home" },
      { label: "Pagine", href: adminPaths.pages, hint: "Chi siamo, Shop, Contatti, Privacy e Cookie", icon: "pages" },
      { label: "Eventi", href: adminPaths.events, hint: "Eventi, moduli e iscrizioni", icon: "calendar" },
      { label: "News", href: adminPaths.news, hint: "Articoli e novità", icon: "news" },
      { label: "Prodotti ABES", href: adminPaths.products, hint: "La vetrina dei prodotti", icon: "jar" },
      { label: "Media", href: adminPaths.media, hint: "Le immagini caricate", icon: "media" },
      { label: "Foto e video reali", href: adminPaths.realMedia, hint: "Foto e video veri negli spazi delle pagine", icon: "camera" },
    ],
  },
  {
    title: "Richieste ricevute",
    items: [
      { label: "Iscrizioni", href: adminPaths.registrations, hint: "Chi si è iscritto agli eventi", icon: "ticket", badge: "registrations" },
      { label: "Candidature", href: adminPaths.applications, hint: "Candidature e CV", icon: "briefcase", badge: "applications" },
      { label: "Messaggi contatti", href: adminPaths.messages, hint: "Messaggi dal modulo contatti", icon: "inbox", badge: "messages" },
    ],
  },
  {
    title: "Impostazioni",
    items: [
      { label: "Email", href: adminPaths.email, hint: "Modelli dei messaggi e invii", icon: "mail", badge: "email" },
      { label: "Impostazioni", href: adminPaths.settings, hint: "Recapiti, notifiche, SEO", icon: "settings" },
    ],
  },
];

/** Shortcuts offered by the command palette (⌘K) besides the sections above. */
export const adminQuickActions: { label: string; href: string; hint: string; icon: IconName; keywords?: string }[] = [
  { label: "Nuovo evento", href: adminPaths.eventNew, hint: "Crea un evento con il modulo di iscrizione", icon: "plus", keywords: "crea aggiungi evento" },
  { label: "Nuova news", href: "/admin/news/nuova", hint: "Scrivi un articolo", icon: "plus", keywords: "crea scrivi articolo notizia" },
  { label: "Nuovo prodotto ABES", href: "/admin/prodotti/nuovo", hint: "Aggiungi un prodotto alla vetrina", icon: "plus", keywords: "crea aggiungi prodotto shop" },
  { label: "Carica immagini", href: adminPaths.media, hint: "Aggiungi foto alla libreria", icon: "media", keywords: "upload foto immagini" },
  { label: "Esporta iscrizioni (CSV)", href: adminPaths.registrationsExport, hint: "Scarica l'elenco degli iscritti", icon: "download", keywords: "csv excel scarica" },
  { label: "Posizioni aperte", href: adminPaths.openings, hint: "Le offerte di Lavora con noi", icon: "briefcase", keywords: "lavoro offerte candidature" },
  { label: "Categorie eventi", href: adminPaths.eventCategories, hint: "Etichette per gli eventi", icon: "calendar" },
  { label: "Registro invii email", href: adminPaths.emailOutbox, hint: "Cosa è partito e cosa no", icon: "mail", keywords: "outbox smtp" },
  { label: "Profilo", href: adminPaths.profile, hint: "Nome, email e password", icon: "user", keywords: "password account" },
];

/** The editable pages (admin > Pagine, and the palette). The Home has its own section. */
export const adminPages: { key: PageKey; title: string; text: string }[] = [
  { key: "chi-siamo", title: "Chi siamo", text: "Storia, missione, valori e luoghi." },
  { key: "shop", title: "Shop ABES", text: "Presentazione del progetto agricolo e vetrina prodotti." },
  { key: "contatti", title: "Contatti", text: "Titolo e testo; i recapiti si modificano in Impostazioni." },
  { key: "eventi", title: "Eventi (testi)", text: "Titolo e introduzioni della pagina eventi. Gli eventi si gestiscono in «Eventi»." },
  { key: "news", title: "News (testi)", text: "Titolo e introduzioni della pagina news. Gli articoli si gestiscono in «News»." },
  { key: "lavora-con-noi", title: "Lavora con noi (testi)", text: "Testi della pagina candidature." },
  { key: "privacy", title: "Privacy", text: "Informativa sul trattamento dei dati (bozza da verificare)." },
  { key: "cookie", title: "Cookie Policy", text: "Informativa sui cookie (bozza da verificare)." },
];
