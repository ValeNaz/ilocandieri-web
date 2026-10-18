import Link from "next/link";
import { PageHeader } from "@/components/admin";
import { requireAdmin } from "@/lib/auth/session";
import { findProductByUrl, importFromAbesUrl } from "@/lib/abes/admin";
import { normalizeAbesProductUrl } from "@/lib/abes/url";
import { adminPaths } from "@/lib/paths";
import { ProductForm, type ProductFormValues } from "../ProductForm";

export const metadata = { title: "Nuovo prodotto ABES" };

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ importa?: string }> }) {
  await requireAdmin();
  const { importa } = await searchParams;
  const values: ProductFormValues = { source: "manual", title: "", url: "", imageUrl: "", imageAlt: "", category: "", priceText: "", priceCheckedOn: "", visible: true, featuredHome: false };
  let notice: { tone: "error" | "info"; text: string; href?: string } | null = null;
  let imported = false;

  if (importa?.trim()) {
    const n = normalizeAbesProductUrl(importa);
    if (!n.ok) notice = { tone: "error", text: n.error };
    else {
      const existing = await findProductByUrl(n.url);
      if (existing) notice = { tone: "info", text: "Questo prodotto è già nella lista.", href: `${adminPaths.products}/${existing.id}` };
      else {
        const r = await importFromAbesUrl(n.url);
        if (!r.ok) {
          values.url = n.url;
          notice = { tone: "error", text: r.error };
        } else {
          Object.assign(values, { title: r.product.title, url: r.product.url, imageUrl: r.product.imageUrl, imageAlt: r.product.imageAlt, category: r.product.category ?? "" });
          imported = true;
        }
      }
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="Nuovo prodotto" description="Aggiungi alla vetrina un prodotto che esiste già su abes.bio." />
      {notice && (
        <p role={notice.tone === "error" ? "alert" : "status"} className={`mb-6 rounded-control border px-4 py-3 text-sm ${notice.tone === "error" ? "border-danger/30 bg-danger-soft text-danger" : "border-line bg-paper-deep"}`}>
          {notice.text} {notice.href && <Link href={notice.href} className="font-medium underline">Apri il prodotto</Link>}
        </p>
      )}
      <ProductForm values={values} imported={imported} />
    </div>
  );
}
