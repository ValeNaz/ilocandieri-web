import { PageHeader } from "@/components/admin";
import { EventForm } from "@/components/admin/events/EventForm";
import { ButtonLink } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { listMediaOptions } from "@/lib/content/media";
import { DEFAULT_FIELDS } from "@/lib/events/forms";
import { emptyFormInitial } from "@/lib/events/form-initial";
import { DEFAULT_MESSAGES } from "@/lib/events/messages";
import { listCategories } from "@/lib/events/service";
import { adminPaths } from "@/lib/paths";

export const metadata = { title: "Nuovo evento" };

export default async function Page() {
  await requireAdmin();
  const [media, categories] = await Promise.all([listMediaOptions(), listCategories()]);
  return (
    <div className="max-w-4xl">
      <PageHeader title="Nuovo evento" description="Si salva come bozza: compare sul sito solo quando lo imposti su «Pubblicato»." actions={<ButtonLink href={adminPaths.events} variant="secondary">Torna agli eventi</ButtonLink>} />
      <EventForm
        initial={emptyFormInitial()}
        meta={{ fields: DEFAULT_FIELDS, formVersion: null, registrationsCount: 0, pendingCount: 0, categories, media, defaults: { ...DEFAULT_MESSAGES } }}
      />
    </div>
  );
}
