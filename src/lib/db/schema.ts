/**
 * Database schema (Drizzle + SQLite/libSQL). Contract: docs/ARCHITECTURE.md.
 * All ids are text (cuid2, see `newId()` in src/lib/db/id.ts). Timestamps are integer ms.
 * DO NOT change without coordinating: other modules rely on this exact shape.
 */
import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const id = () => text("id").primaryKey();
const ts = (name: string) => integer(name, { mode: "number" });
const now = () => sql`(unixepoch() * 1000)`;

// ---------- Auth ----------
export const users = sqliteTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name").notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "editor"] }).notNull().default("admin"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: ts("created_at").notNull().default(now()),
  lastLoginAt: ts("last_login_at"),
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: id(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: ts("expires_at").notNull(),
    createdAt: ts("created_at").notNull().default(now()),
    userAgent: text("user_agent"),
  },
  (t) => [index("sessions_user_idx").on(t.userId), index("sessions_expires_idx").on(t.expiresAt)],
);

export const passwordResets = sqliteTable(
  "password_resets",
  {
    id: id(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: ts("expires_at").notNull(),
    usedAt: ts("used_at"),
  },
  (t) => [index("password_resets_user_idx").on(t.userId)],
);

export const rateLimits = sqliteTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: ts("window_start").notNull(),
});

export const auditLog = sqliteTable(
  "audit_log",
  {
    id: id(),
    userId: text("user_id"),
    action: text("action").notNull(),
    entity: text("entity"),
    entityId: text("entity_id"),
    createdAt: ts("created_at").notNull().default(now()),
  },
  (t) => [index("audit_log_created_idx").on(t.createdAt)],
);

// ---------- Content ----------
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).notNull(),
});

export const media = sqliteTable("media", {
  id: id(),
  path: text("path").notNull().unique(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  width: integer("width"),
  height: integer("height"),
  alt: text("alt").notNull().default(""),
  credit: text("credit"),
  createdAt: ts("created_at").notNull().default(now()),
});

export const pages = sqliteTable("pages", {
  id: id(),
  key: text("key", {
    enum: ["home", "chi-siamo", "shop", "eventi", "news", "lavora-con-noi", "contatti", "privacy", "cookie"],
  }).notNull().unique(),
  title: text("title").notNull(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ogImageId: text("og_image_id").references(() => media.id, { onDelete: "set null" }),
  updatedAt: ts("updated_at").notNull().default(now()),
});

export const pageBlocks = sqliteTable(
  "page_blocks",
  {
    id: id(),
    pageId: text("page_id").notNull().references(() => pages.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    position: integer("position").notNull().default(0),
    visible: integer("visible", { mode: "boolean" }).notNull().default(true),
    data: text("data", { mode: "json" }).notNull(),
    updatedAt: ts("updated_at").notNull().default(now()),
  },
  (t) => [index("page_blocks_page_pos_idx").on(t.pageId, t.position)],
);

// ---------- News ----------
export const newsCategories = sqliteTable("news_categories", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const news = sqliteTable(
  "news",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    body: text("body").notNull().default(""),
    coverId: text("cover_id").references(() => media.id, { onDelete: "set null" }),
    categoryId: text("category_id").references(() => newsCategories.id, { onDelete: "set null" }),
    status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    publishedAt: ts("published_at"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    ogImageId: text("og_image_id").references(() => media.id, { onDelete: "set null" }),
    createdAt: ts("created_at").notNull().default(now()),
    updatedAt: ts("updated_at").notNull().default(now()),
  },
  (t) => [index("news_status_pub_idx").on(t.status, t.publishedAt), index("news_category_idx").on(t.categoryId)],
);

export const newsImages = sqliteTable(
  "news_images",
  {
    newsId: text("news_id").notNull().references(() => news.id, { onDelete: "cascade" }),
    mediaId: text("media_id").notNull().references(() => media.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.newsId, t.mediaId] })],
);

// ---------- Events ----------
export const eventCategories = sqliteTable("event_categories", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const events = sqliteTable(
  "events",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    body: text("body").notNull().default(""),
    startsAt: ts("starts_at").notNull(),
    endsAt: ts("ends_at"),
    location: text("location"),
    coverId: text("cover_id").references(() => media.id, { onDelete: "set null" }),
    categoryId: text("category_id").references(() => eventCategories.id, { onDelete: "set null" }),
    audience: text("audience"),
    status: text("status", { enum: ["draft", "published", "hidden"] }).notNull().default("draft"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    ctaType: text("cta_type", {
      enum: ["none", "external_link", "whatsapp", "email", "contact", "registration"],
    }).notNull().default("none"),
    ctaLabel: text("cta_label"),
    ctaTarget: text("cta_target"),
    registrationMode: text("registration_mode", { enum: ["open", "limited", "approval", "reserved"] }),
    capacity: integer("capacity"),
    maxSeatsPerRequest: integer("max_seats_per_request").notNull().default(1),
    pendingHoldsSeats: integer("pending_holds_seats", { mode: "boolean" }).notNull().default(false),
    reservedCriteria: text("reserved_criteria"),
    reservedVerification: text("reserved_verification", { enum: ["manual"] }),
    registrationOpensAt: ts("registration_opens_at"),
    registrationClosesAt: ts("registration_closes_at"),
    registrationManuallyClosed: integer("registration_manually_closed", { mode: "boolean" }).notNull().default(false),
    seatsConfirmed: integer("seats_confirmed").notNull().default(0),
    seatsHeld: integer("seats_held").notNull().default(0),
    privacyNote: text("privacy_note"),
    /** JSON overrides for public messages (confirmed, pending, full, closed, past). */
    successMessage: text("success_message", { mode: "json" }),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    createdAt: ts("created_at").notNull().default(now()),
    updatedAt: ts("updated_at").notNull().default(now()),
  },
  (t) => [index("events_status_starts_idx").on(t.status, t.startsAt), index("events_category_idx").on(t.categoryId)],
);

export type EventFormField = {
  id: string;
  type: "text" | "textarea" | "email" | "phone" | "select" | "checkbox" | "seats";
  label: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  help?: string;
};

export const eventFormVersions = sqliteTable(
  "event_form_versions",
  {
    id: id(),
    eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    fields: text("fields", { mode: "json" }).$type<EventFormField[]>().notNull(),
    createdAt: ts("created_at").notNull().default(now()),
  },
  (t) => [uniqueIndex("event_form_versions_event_version_uq").on(t.eventId, t.version)],
);

export const registrations = sqliteTable(
  "registrations",
  {
    id: id(),
    eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    formVersionId: text("form_version_id").notNull().references(() => eventFormVersions.id),
    status: text("status", { enum: ["pending", "confirmed", "rejected", "cancelled"] }).notNull(),
    seats: integer("seats").notNull().default(1),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailNormalized: text("email_normalized").notNull(),
    phone: text("phone"),
    answers: text("answers", { mode: "json" }).$type<{ fieldId: string; label: string; value: unknown }[]>(),
    /** `${eventId}:${emailNormalized}` while active; NULL when rejected/cancelled. */
    dedupeKey: text("dedupe_key").unique(),
    adminNote: text("admin_note"),
    decidedAt: ts("decided_at"),
    decidedBy: text("decided_by"),
    createdAt: ts("created_at").notNull().default(now()),
    ipHash: text("ip_hash"),
  },
  (t) => [index("registrations_event_status_idx").on(t.eventId, t.status), index("registrations_created_idx").on(t.createdAt)],
);

// ---------- ABES showcase ----------
export const products = sqliteTable(
  "products",
  {
    id: id(),
    source: text("source", { enum: ["manual", "shopify"] }).notNull().default("manual"),
    externalId: text("external_id"),
    handle: text("handle"),
    title: text("title").notNull(),
    /** MUST start with https://abes.bio/products/ (validated in lib/abes). */
    url: text("url").notNull(),
    imageUrl: text("image_url").notNull(),
    imageAlt: text("image_alt").notNull().default(""),
    category: text("category"),
    priceText: text("price_text"),
    priceCheckedAt: ts("price_checked_at"),
    available: integer("available", { mode: "boolean" }),
    visible: integer("visible", { mode: "boolean" }).notNull().default(true),
    featuredHome: integer("featured_home", { mode: "boolean" }).notNull().default(false),
    position: integer("position").notNull().default(0),
    syncStatus: text("sync_status"),
    lastSyncedAt: ts("last_synced_at"),
    createdAt: ts("created_at").notNull().default(now()),
    updatedAt: ts("updated_at").notNull().default(now()),
  },
  (t) => [uniqueIndex("products_url_uq").on(t.url), index("products_visible_pos_idx").on(t.visible, t.position)],
);

// ---------- Careers ----------
export const jobOpenings = sqliteTable("job_openings", {
  id: id(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  status: text("status", { enum: ["draft", "open", "closed"] }).notNull().default("draft"),
  createdAt: ts("created_at").notNull().default(now()),
});

export const applications = sqliteTable(
  "applications",
  {
    id: id(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    area: text("area").notNull(),
    openingId: text("opening_id").references(() => jobOpenings.id, { onDelete: "set null" }),
    message: text("message").notNull().default(""),
    /** Relative path inside storage/private (never public). */
    cvPath: text("cv_path"),
    cvName: text("cv_name"),
    cvMime: text("cv_mime"),
    cvSize: integer("cv_size"),
    privacyAcceptedAt: ts("privacy_accepted_at").notNull(),
    privacyVersion: text("privacy_version").notNull(),
    status: text("status", { enum: ["new", "reviewing", "archived"] }).notNull().default("new"),
    createdAt: ts("created_at").notNull().default(now()),
    ipHash: text("ip_hash"),
  },
  (t) => [index("applications_status_created_idx").on(t.status, t.createdAt)],
);

export const contactMessages = sqliteTable(
  "contact_messages",
  {
    id: id(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull().default(""),
    message: text("message").notNull(),
    status: text("status", { enum: ["new", "handled"] }).notNull().default("new"),
    createdAt: ts("created_at").notNull().default(now()),
    ipHash: text("ip_hash"),
  },
  (t) => [index("contact_messages_status_created_idx").on(t.status, t.createdAt)],
);

// ---------- Email ----------
export const emailTemplates = sqliteTable("email_templates", {
  key: text("key").primaryKey(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  updatedAt: ts("updated_at").notNull().default(now()),
});

export const emailOutbox = sqliteTable(
  "email_outbox",
  {
    id: id(),
    idempotencyKey: text("idempotency_key").notNull().unique(),
    to: text("to").notNull(),
    subject: text("subject").notNull(),
    text: text("text").notNull(),
    html: text("html"),
    status: text("status", { enum: ["queued", "sent", "failed", "not_configured"] }).notNull().default("queued"),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    sentAt: ts("sent_at"),
    createdAt: ts("created_at").notNull().default(now()),
  },
  (t) => [index("email_outbox_status_created_idx").on(t.status, t.createdAt)],
);
