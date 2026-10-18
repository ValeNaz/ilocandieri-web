/**
 * Single source of truth for URLs. ALWAYS use these helpers instead of hardcoding paths.
 */
export const paths = {
  home: "/",
  about: "/chi-siamo",
  shop: "/shop",
  events: "/eventi",
  event: (slug: string) => `/eventi/${slug}`,
  news: "/news",
  newsItem: (slug: string) => `/news/${slug}`,
  careers: "/lavora-con-noi",
  contacts: "/contatti",
  privacy: "/privacy",
  cookies: "/cookie-policy",
  abesShop: "https://abes.bio/collections/all",
} as const;

export const adminPaths = {
  root: "/admin",
  login: "/admin/login",
  forgot: "/admin/password-dimenticata",
  reset: (token: string) => `/admin/reimposta?token=${encodeURIComponent(token)}`,
  dashboard: "/admin",
  home: "/admin/home",
  pages: "/admin/pagine",
  page: (key: string) => `/admin/pagine/${key}`,
  media: "/admin/media",
  products: "/admin/prodotti",
  news: "/admin/news",
  events: "/admin/eventi",
  registrations: "/admin/iscrizioni",
  applications: "/admin/candidature",
  messages: "/admin/messaggi",
  email: "/admin/email",
  settings: "/admin/impostazioni",
  profile: "/admin/profilo",
} as const;
