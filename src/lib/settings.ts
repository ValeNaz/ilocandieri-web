import { eq } from "drizzle-orm";
import { cache } from "react";
import { db, schema } from "@/lib/db";

/** Typed settings. Keys per contract: org, notifications, analytics, retention, seo_defaults, footer. */
export type OrgSettings = {
  name: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  vatId: string;
  social: { facebook?: string; instagram?: string; linkedin?: string; youtube?: string };
  /** Field names still to be confirmed with the cooperative (shown only in admin). */
  toVerify: string[];
};
export type NotificationSettings = { registrationsTo: string[]; applicationsTo: string[]; contactsTo: string[] };
export type AnalyticsSettings = { gaMeasurementId: string; searchConsoleVerification: string };
export type RetentionSettings = { applicationsDays: number; pastRegistrationsDays: number };
export type SeoDefaults = { siteName: string; titleTemplate: string; description: string; ogImageId: string | null };
export type FooterSettings = { line: string };

export type SettingsMap = {
  org: OrgSettings;
  notifications: NotificationSettings;
  analytics: AnalyticsSettings;
  retention: RetentionSettings;
  seo_defaults: SeoDefaults;
  footer: FooterSettings;
};
export type SettingKey = keyof SettingsMap;

export const DEFAULT_SETTINGS: SettingsMap = {
  org: { name: "I Locandieri Soc. Coop.", phone: "", email: "", address: "", whatsapp: "", vatId: "", social: {}, toVerify: [] },
  notifications: { registrationsTo: [], applicationsTo: [], contactsTo: [] },
  analytics: { gaMeasurementId: "", searchConsoleVerification: "" },
  retention: { applicationsDays: 365, pastRegistrationsDays: 365 },
  seo_defaults: { siteName: "I Locandieri", titleTemplate: "%s | I Locandieri", description: "", ogImageId: null },
  footer: { line: "Coltiviamo possibilità, costruiamo comunità." },
};

/** Read a setting merged over defaults (shallow). Cached per request. */
export const getSetting = cache(async <K extends SettingKey>(key: K): Promise<SettingsMap[K]> => {
  const [row] = await db.select().from(schema.settings).where(eq(schema.settings.key, key));
  return { ...DEFAULT_SETTINGS[key], ...((row?.value as object | undefined) ?? {}) } as SettingsMap[K];
});

export async function setSetting<K extends SettingKey>(key: K, value: SettingsMap[K]): Promise<void> {
  await db.insert(schema.settings).values({ key, value }).onConflictDoUpdate({ target: schema.settings.key, set: { value } });
}
