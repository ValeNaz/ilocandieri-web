"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { actionError, actionOk, zodFieldErrors, type ActionState } from "@/lib/actions";
import { moveProduct, setFlag, deleteProduct, getProduct, findProductByUrl, nextPosition } from "@/lib/abes/admin";
import { productInputSchema } from "@/lib/abes/schema";
import { normalizeProductImageUrl } from "@/lib/abes/url";
import { getProviderStatus } from "@/lib/abes/provider";
import { syncShopify } from "@/lib/abes/shopify";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { db, newId, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { flash } from "@/lib/flash";
import { adminPaths, paths } from "@/lib/paths";
import { isUploaded, saveImageUpload } from "@/lib/uploads";

function romeToday() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Rome" }).format(new Date());
}
const dayToMs = (d: string) => Date.parse(`${d}T12:00:00Z`);

function touchPublic() {
  revalidatePath(paths.home);
  revalidatePath(paths.shop);
}

export async function saveProductAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = id ? await getProduct(id) : null;
  if (id && !existing) return actionError("Prodotto non trovato.");

  const parsed = productInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return actionError("Controlla i campi evidenziati.", zodFieldErrors(parsed.error));
  const d = parsed.data;
  const synced = existing?.source === "shopify";

  // Image: uploaded file wins, then the URL field.
  let imageUrl = "";
  const file = formData.get("imageFile");
  if (isUploaded(file)) {
    const up = await saveImageUpload(file, { alt: d.imageAlt || d.title });
    if (!up.ok) return actionError("Controlla i campi evidenziati.", { imageFile: up.error });
    imageUrl = `/media/${up.path}`;
  } else if (d.imageUrl) {
    const n = normalizeProductImageUrl(d.imageUrl);
    if (!n.ok) return actionError("Controlla i campi evidenziati.", { imageUrl: n.error });
    imageUrl = n.url;
  } else if (existing?.imageUrl) {
    imageUrl = existing.imageUrl;
  } else {
    return actionError("Controlla i campi evidenziati.", { imageUrl: "Serve una foto del prodotto: carica un file o incolla l'indirizzo immagine di ABES." });
  }

  const dup = await findProductByUrl(d.url);
  if (dup && dup.id !== id) return actionError("Controlla i campi evidenziati.", { url: "Questo prodotto è già nella lista." });

  // Manual price: optional, with a verification date. Never presented as "updated" automatically.
  const priceText: string | null = d.priceText || null;
  let priceCheckedAt: number | null = null;
  if (priceText) {
    const changed = priceText !== (existing?.priceText ?? "");
    const oldDay = existing?.priceCheckedAt ? new Date(existing.priceCheckedAt).toISOString().slice(0, 10) : "";
    const day = !d.priceCheckedOn || (changed && d.priceCheckedOn === oldDay) ? romeToday() : d.priceCheckedOn;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(dayToMs(day))) return actionError("Controlla i campi evidenziati.", { priceCheckedOn: "Data non valida." });
    priceCheckedAt = dayToMs(day);
  }

  const now = Date.now();
  const handle = d.url.slice(d.url.lastIndexOf("/") + 1);
  if (existing) {
    await db.update(schema.products).set(
      synced
        ? { imageAlt: d.imageAlt, category: d.category || null, visible: d.visible, featuredHome: d.featuredHome, updatedAt: now }
        : { title: d.title, url: d.url, handle, imageUrl, imageAlt: d.imageAlt, category: d.category || null, priceText, priceCheckedAt, visible: d.visible, featuredHome: d.featuredHome, updatedAt: now },
    ).where(eq(schema.products.id, existing.id));
    await audit(user.id, "product_updated", "product", existing.id);
    touchPublic();
    return actionOk("Prodotto salvato.");
  }
  const newProductId = newId();
  await db.insert(schema.products).values({
    id: newProductId, source: "manual", handle, title: d.title, url: d.url, imageUrl, imageAlt: d.imageAlt, category: d.category || null,
    priceText, priceCheckedAt, visible: d.visible, featuredHome: d.featuredHome, position: await nextPosition(), createdAt: now, updatedAt: now,
  });
  await audit(user.id, "product_created", "product", newProductId);
  touchPublic();
  await flash("success", "Prodotto aggiunto alla vetrina.");
  redirect(adminPaths.products);
}

export async function moveProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const dir = formData.get("dir") === "up" ? "up" : "down";
  await moveProduct(id, dir);
  touchPublic();
  revalidatePath(adminPaths.products);
}

export async function toggleProductAction(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const flag = formData.get("flag") === "featuredHome" ? "featuredHome" : "visible";
  const value = formData.get("value") === "1";
  await setFlag(id, flag, value);
  await audit(user.id, `product_${flag}_${value ? "on" : "off"}`, "product", id);
  touchPublic();
  revalidatePath(adminPaths.products);
}

export async function deleteProductAction(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await deleteProduct(id);
  await audit(user.id, "product_deleted", "product", id);
  touchPublic();
  await flash("success", "Prodotto rimosso dalla vetrina. Su ABES non cambia nulla.");
  redirect(adminPaths.products);
}

export async function syncNowAction() {
  const user = await requireAdmin();
  if (getProviderStatus().kind !== "shopify") {
    await flash("error", "Shopify non è configurato: la sincronizzazione non è disponibile.");
    redirect(adminPaths.products);
  }
  const r = await syncShopify();
  await audit(user.id, r.ok ? "products_synced" : "products_sync_failed", "product");
  touchPublic();
  if (r.ok) await flash("success", `Sincronizzazione completata: ${r.created} nuovi, ${r.updated} aggiornati, ${r.removed} nascosti perché non più su ABES.`);
  else await flash("error", `Sincronizzazione non riuscita: ${r.error} Resta visibile l'ultima copia valida.`);
  redirect(adminPaths.products);
}
