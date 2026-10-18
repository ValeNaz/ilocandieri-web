import { notFound } from "next/navigation";
import { ConfirmDialog } from "@/components/ui";
import { PageHeader } from "@/components/admin";
import { requireAdmin } from "@/lib/auth/session";
import { getProduct } from "@/lib/abes/admin";
import { ProductForm } from "../ProductForm";
import { deleteProductAction } from "../actions";

export const metadata = { title: "Modifica prodotto ABES" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const p = await getProduct(id);
  if (!p) notFound();
  return (
    <div className="max-w-3xl">
      <PageHeader
        title={p.title}
        description="Modifica come questo prodotto appare nella vetrina. Prezzi, ordini e disponibilità si gestiscono solo su ABES."
        actions={<ConfirmDialog triggerLabel="Rimuovi dalla vetrina" triggerVariant="secondary" title="Rimuovere questo prodotto dalla vetrina?"
          description="Sparisce da Home e Shop del sito I Locandieri. Il prodotto su abes.bio non viene toccato. In alternativa puoi solo nasconderlo." confirmLabel="Rimuovi" action={deleteProductAction} fields={{ id: p.id }} />}
      />
      <ProductForm values={{
        id: p.id, source: p.source, title: p.title, url: p.url, imageUrl: p.imageUrl, imageAlt: p.imageAlt, category: p.category ?? "",
        priceText: p.priceText ?? "", priceCheckedOn: p.priceCheckedAt ? new Date(p.priceCheckedAt).toISOString().slice(0, 10) : "", visible: p.visible, featuredHome: p.featuredHome,
      }} />
    </div>
  );
}
