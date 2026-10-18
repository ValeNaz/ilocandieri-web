import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsArticle } from "@/components/public/news/NewsArticle";
import { getSiteUrl } from "@/lib/env";
import { getRelatedNews, getPublishedBySlug, type NewsArticleData } from "@/lib/news/public";
import { paths } from "@/lib/paths";
import { getSetting } from "@/lib/settings";
import { stripHtml } from "@/lib/security";

type Params = { params: Promise<{ slug: string }> };

const abs = (u: string | null) => (u ? (u.startsWith("http") ? u : `${getSiteUrl()}${u}`) : null);

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const a = await getPublishedBySlug(slug);
  if (!a) return { title: "Pagina non trovata", robots: { index: false } };
  const seo = await getSetting("seo_defaults");
  const title = a.seoTitle || a.title;
  const description = a.seoDescription || a.excerpt || stripHtml(a.body).slice(0, 160) || seo.description || undefined;
  const image = abs(a.ogImageUrl ?? a.coverUrl);
  const url = `${getSiteUrl()}${paths.newsItem(a.slug)}`;
  return {
    title: { absolute: `${title} | ${seo.siteName}` },
    description,
    alternates: { canonical: paths.newsItem(a.slug) },
    openGraph: {
      type: "article", title, description, url, siteName: seo.siteName, locale: "it_IT",
      publishedTime: new Date(a.publishedAt).toISOString(), modifiedTime: new Date(a.updatedAt).toISOString(),
      ...(a.categoryName ? { section: a.categoryName } : {}),
      ...(image ? { images: [{ url: image, alt: a.ogImageUrl ? title : a.coverAlt || title }] } : {}),
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, ...(image ? { images: [image] } : {}) },
  };
}

function jsonLd(a: NewsArticleData, org: string) {
  const image = abs(a.ogImageUrl ?? a.coverUrl);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt ?? undefined,
    datePublished: new Date(a.publishedAt).toISOString(),
    dateModified: new Date(a.updatedAt).toISOString(),
    mainEntityOfPage: `${getSiteUrl()}${paths.newsItem(a.slug)}`,
    inLanguage: "it-IT",
    ...(image ? { image: [image] } : {}),
    ...(a.categoryName ? { articleSection: a.categoryName } : {}),
    author: { "@type": "Organization", name: org },
    publisher: { "@type": "Organization", name: org },
  };
}

export default async function NewsItemPage({ params }: Params) {
  const { slug } = await params;
  const article = await getPublishedBySlug(slug); // drafts / scheduled / unknown -> null -> 404
  if (!article) notFound();
  const [related, seo] = await Promise.all([getRelatedNews(article, 3), getSetting("seo_defaults")]);
  const ld = JSON.stringify(jsonLd(article, seo.siteName)).replace(/</g, "\\u003c");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
      <NewsArticle article={article} related={related} shareUrl={`${getSiteUrl()}${paths.newsItem(article.slug)}`} />
    </>
  );
}
