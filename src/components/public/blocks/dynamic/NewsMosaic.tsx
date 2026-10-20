import Image from "next/image";
import Link from "next/link";
import { PillLink } from "@/components/public/abes/PillLink";
import { Room, Wrap } from "@/components/public/kit/Room";
import type { Cta } from "@/lib/content/blocks";
import type { NewsCardData } from "@/lib/news/public";
import { paths } from "@/lib/paths";
import { formatDate } from "@/lib/utils";
import "./dynamic.css";

const BG = [
  { b: "var(--c-orange)", f: "var(--c-ink)" },
  { b: "var(--c-green)", f: "var(--c-white)" },
  { b: "var(--c-yellow)", f: "var(--c-ink)" },
] as const;

/** Latest news in an asymmetric layout: one big story and smaller ones. Covers are cut into rounded shapes; without a cover, a colour panel with the day. */
export function NewsMosaic({ news, eyebrow, title, text, cta, emptyMessage, level = 2, id }: { id?: string; news: NewsCardData[]; eyebrow?: string; title: string; text?: string; cta?: Cta | null; emptyMessage?: string; level?: 1 | 2 }) {
  const H = level === 1 ? "h1" : "h2";
  return (
    <Room tone="white" id={id} className="py-16 sm:py-28">
      <Wrap>
        <div className="grid items-end gap-6 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-8">
            {eyebrow && <p className="t-label mb-4 text-[var(--pop-text)]">{eyebrow}</p>}
            <H className="t-giant">{title}</H>
          </div>
          {text && <p className="t-body lg:col-span-4">{text}</p>}
        </div>
        {news.length > 0 ? (
          <ul className={`nw nw-n ${news.length === 1 ? "nw-1" : ""} mt-12`}>
            {news.map((n, i) => {
              const c = BG[i % 3]!;
              return (
                <li key={n.id}>
                  <article className={`nw-card ${i === 0 ? "nw-first" : ""}`} style={{ ["--nb" as string]: c.b, ["--nf" as string]: c.f }}>
                    <div className="nw-pic">
                      {n.coverUrl ? <Image src={n.coverUrl} alt={n.coverAlt} fill sizes="(min-width:900px) 50vw, 90vw" className="object-cover" /> : <span className="nw-big" aria-hidden="true">{new Date(n.publishedAt).getDate()}</span>}
                    </div>
                    <div className="nw-txt">
                      <p className="nw-meta">{n.categoryName && <span>{n.categoryName} · </span>}<time dateTime={new Date(n.publishedAt).toISOString()}>{formatDate(n.publishedAt)}</time></p>
                      <h3 className="nw-title"><Link href={paths.newsItem(n.slug)}>{n.title}</Link></h3>
                      {n.excerpt && <p className="nw-ex">{n.excerpt}</p>}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : emptyMessage ? (
          <div className="etk-empty mt-12" style={{ background: "var(--c-orange)", borderColor: "var(--c-ink)" }}>
            <p className="t-head">{emptyMessage}</p>
          </div>
        ) : null}
        {cta && <div className="mt-10"><PillLink href={cta.href}>{cta.label}</PillLink></div>}
      </Wrap>
    </Room>
  );
}
