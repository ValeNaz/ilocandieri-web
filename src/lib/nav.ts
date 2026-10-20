import { paths } from "@/lib/paths";

/** Flat list (footer, sitemap-like uses). */
export const publicNav = [
  { label: "Home", href: paths.home },
  { label: "Chi siamo", href: paths.about },
  { label: "Storia", href: paths.history },
  { label: "Luoghi", href: paths.places },
  { label: "Accoglienza", href: paths.welcome },
  { label: "Tradizione", href: paths.tradition },
  { label: "ABES", href: paths.abes },
  { label: "Shop ABES", href: paths.shop },
  { label: "Eventi", href: paths.events },
  { label: "News", href: paths.news },
  { label: "Lavora con noi", href: paths.careers },
  { label: "Contatti", href: paths.contacts },
] as const;

/** Header structure: top-level entries; a `children` list opens a group menu. */
export const navGroups: readonly { label: string; href: string; children?: readonly { label: string; href: string; note: string }[] }[] = [
  {
    label: "Chi siamo",
    href: paths.about,
    children: [
      { label: "La cooperativa", href: paths.about, note: "Chi siamo e come lavoriamo" },
      { label: "Storia", href: paths.history, note: "Dal 2008 a oggi, e dal Settecento" },
      { label: "Accoglienza", href: paths.welcome, note: "Il CAS Locanda e la comunità per minori" },
      { label: "Lavora con noi", href: paths.careers, note: "Candidature spontanee" },
    ],
  },
  {
    label: "Luoghi",
    href: paths.places,
    children: [
      { label: "Tutti i luoghi", href: paths.places, note: "La mappa dei beni restituiti" },
      { label: "Il Giardino delle Arance", href: paths.placeGarden, note: "Casolare, agrumeto, orto" },
      { label: "Campo Unità d'Italia", href: paths.placeField, note: "Sport e comunità" },
    ],
  },
  {
    label: "Terra",
    href: paths.tradition,
    children: [
      { label: "Tradizione", href: paths.tradition, note: "Grano, ulivi, pane nero, Selinunte" },
      { label: "ABES", href: paths.abes, note: "Dal seme al barattolo" },
      { label: "Shop ABES", href: paths.shop, note: "I prodotti" },
    ],
  },
  { label: "Eventi", href: paths.events },
  { label: "News", href: paths.news },
  { label: "Contatti", href: paths.contacts },
];

export const legalNav = [
  { label: "Privacy", href: paths.privacy },
  { label: "Cookie Policy", href: paths.cookies },
  { label: "Crediti", href: paths.credits },
] as const;
