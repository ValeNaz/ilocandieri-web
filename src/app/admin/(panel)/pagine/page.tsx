import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { ButtonLink, Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { PAGE_URLS, type PageKey } from "@/lib/content/blocks";
import { adminPaths } from "@/lib/paths";

export const metadata = { title: "Pagine" };

const LIST: { key: PageKey; title: string; text: string }[] = [
  { key: "chi-siamo", title: "Chi siamo", text: "Storia, missione, valori e luoghi." },
  { key: "shop", title: "Shop ABES", text: "Presentazione del progetto agricolo e vetrina prodotti." },
  { key: "contatti", title: "Contatti", text: "Titolo e testo; i recapiti si modificano in Impostazioni." },
  { key: "privacy", title: "Privacy", text: "Informativa sul trattamento dei dati (bozza da verificare)." },
  { key: "cookie", title: "Cookie Policy", text: "Informativa sui cookie (bozza da verificare)." },
  { key: "eventi", title: "Eventi (testi)", text: "Titolo e introduzioni della pagina eventi. Gli eventi si gestiscono in «Eventi»." },
  { key: "news", title: "News (testi)", text: "Titolo e introduzioni della pagina news. Gli articoli si gestiscono in «News»." },
  { key: "lavora-con-noi", title: "Lavora con noi (testi)", text: "Testi della pagina candidature." },
];

export default async function Page() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Pagine" description="Scegli la pagina da modificare. La Home ha una sezione dedicata nel menu." actions={<ButtonLink href={adminPaths.home} variant="secondary">Modifica la Home</ButtonLink>} />
      <ul className="grid gap-4 md:grid-cols-2">
        {LIST.map((p) => (
          <li key={p.key}>
            <Card className="flex h-full flex-col p-6">
              <h2 className="font-display text-2xl font-medium">{p.title}</h2>
              <p className="mt-2 flex-1 text-ink-soft">{p.text}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <ButtonLink href={adminPaths.page(p.key)} size="sm">Modifica</ButtonLink>
                <ButtonLink href={PAGE_URLS[p.key]} size="sm" variant="secondary" target="_blank" rel="noopener">Vedi pagina<span className="sr-only"> (nuova scheda)</span></ButtonLink>
              </div>
            </Card>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-ink-soft">Per le impostazioni SEO predefinite del sito vai in <Link className="underline" href={adminPaths.settings}>Impostazioni</Link>.</p>
    </>
  );
}
