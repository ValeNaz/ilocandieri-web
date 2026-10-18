import { PageHeader } from "@/components/admin/PageHeader";
import { AnalyticsForm, NotificationsForm, OrgForm, RetentionForm, SeoDefaultsForm } from "@/components/admin/content/SettingsForms";
import { requireAdmin } from "@/lib/auth/session";
import { listMediaOptions } from "@/lib/content/media";
import { getSetting } from "@/lib/settings";

export const metadata = { title: "Impostazioni" };

export default async function Page() {
  await requireAdmin();
  const [org, footer, notifications, analytics, retention, seo, media] = await Promise.all([
    getSetting("org"), getSetting("footer"), getSetting("notifications"), getSetting("analytics"), getSetting("retention"), getSetting("seo_defaults"), listMediaOptions(),
  ]);
  return (
    <>
      <PageHeader title="Impostazioni" description="Recapiti, notifiche, statistiche, conservazione dei dati e SEO del sito." />
      <div className="max-w-4xl space-y-8">
        <OrgForm org={org} footer={footer} />
        <NotificationsForm n={notifications} />
        <AnalyticsForm a={analytics} />
        <RetentionForm r={retention} />
        <SeoDefaultsForm s={seo} media={media} />
      </div>
    </>
  );
}
