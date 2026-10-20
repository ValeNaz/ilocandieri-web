import { adminPaths } from "@/lib/paths";

export type AdminNavItem = { label: string; href: string; hint: string; exact?: boolean };
export type AdminNavGroup = { title: string; items: AdminNavItem[] };

/** Sidebar structure (plain-language labels for non-technical editors). */
export const adminNav: AdminNavGroup[] = [
  { title: "Panoramica", items: [{ label: "Dashboard", href: adminPaths.dashboard, hint: "Riepilogo di cosa succede", exact: true }] },
  {
    title: "Contenuti del sito",
    items: [
      { label: "Home", href: adminPaths.home, hint: "Testi, immagini e sezioni della home" },
      { label: "Pagine", href: adminPaths.pages, hint: "Chi siamo, Shop, Contatti, Privacy e Cookie" },
      { label: "Media", href: adminPaths.media, hint: "Le immagini caricate" },
      { label: "Foto e video reali", href: adminPaths.realMedia, hint: "Foto e video veri negli spazi delle pagine" },
      { label: "Prodotti ABES", href: adminPaths.products, hint: "La vetrina dei prodotti" },
      { label: "News", href: adminPaths.news, hint: "Articoli e novità" },
      { label: "Eventi", href: adminPaths.events, hint: "Eventi, moduli e iscrizioni" },
    ],
  },
  {
    title: "Richieste ricevute",
    items: [
      { label: "Iscrizioni", href: adminPaths.registrations, hint: "Chi si è iscritto agli eventi" },
      { label: "Candidature", href: adminPaths.applications, hint: "Candidature e CV" },
      { label: "Messaggi contatti", href: adminPaths.messages, hint: "Messaggi dal modulo contatti" },
    ],
  },
  {
    title: "Impostazioni",
    items: [
      { label: "Email", href: adminPaths.email, hint: "Modelli dei messaggi e invii" },
      { label: "Impostazioni", href: adminPaths.settings, hint: "Recapiti, notifiche, SEO" },
    ],
  },
];
