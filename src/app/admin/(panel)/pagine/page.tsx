import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Icon } from "@/components/admin/icons";
import { ButtonLink } from "@/components/ui";
import { adminPages } from "@/lib/admin-nav";
import { requireAdmin } from "@/lib/auth/session";
import { PAGE_URLS } from "@/lib/content/blocks";
import { adminPaths } from "@/lib/paths";

export const metadata = { title: "Pagine" };

export default async function Page() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Pagine" description="Scegli la pagina da modificare. La Home ha una sezione dedicata nel menu." actions={<ButtonLink href={adminPaths.home} variant="secondary" size="sm"><Icon name="home" className="size-4" />Modifica la Home</ButtonLink>} />
      <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-card">
        {adminPages.map((p) => (
          <li key={p.key} className="group relative flex items-center gap-4 px-5 py-4 transition-colors hover:bg-paper">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-paper-deep text-ink-soft transition-colors group-hover:bg-terracotta-soft group-hover:text-terracotta-deep"><Icon name="pages" /></span>
            <span className="min-w-0 flex-1">
              <Link href={adminPaths.page(p.key)} className="font-semibold after:absolute after:inset-0 after:content-['']">{p.title}</Link>
              <span className="block text-sm text-ink-soft">{p.text}</span>
            </span>
            <a href={PAGE_URLS[p.key]} target="_blank" rel="noopener" className="relative z-10 hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-soft hover:bg-paper-deep hover:text-ink sm:inline-flex">
              Vedi<Icon name="external" className="size-4" /><span className="sr-only"> la pagina {p.title} (nuova scheda)</span>
            </a>
            <Icon name="arrow" className="size-4 shrink-0 text-ink-soft transition-transform group-hover:translate-x-0.5" />
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-ink-soft">Per le impostazioni SEO predefinite del sito vai in <Link className="underline" href={adminPaths.settings}>Impostazioni</Link>.</p>
    </>
  );
}
