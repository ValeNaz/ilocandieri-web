import { paths } from "@/lib/paths";

export const publicNav = [
  { label: "Home", href: paths.home },
  { label: "Chi siamo", href: paths.about },
  { label: "Shop ABES", href: paths.shop },
  { label: "Eventi", href: paths.events },
  { label: "News", href: paths.news },
  { label: "Lavora con noi", href: paths.careers },
  { label: "Contatti", href: paths.contacts },
] as const;

export const legalNav = [
  { label: "Privacy", href: paths.privacy },
  { label: "Cookie Policy", href: paths.cookies },
  { label: "Crediti", href: paths.credits },
] as const;
