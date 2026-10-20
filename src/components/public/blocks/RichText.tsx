import { LegalHero } from "@/components/public/liste/PageHeroes";
import { Room, Wrap } from "@/components/public/kit/Room";
import type { BlockDataOf } from "@/lib/content/blocks";
import { renderRichHtml } from "@/lib/content/rich";
import { getSetting } from "@/lib/settings";
import { getSiteUrl } from "@/lib/env";
import "../liste/liste.css";
import { BlockHeading, type HeadingLevel } from "./shared";

/** Legal / long text, in a white room with clear typography. With `scene`, a compact living scene sits beside the title. */
export async function RichTextBlock({ data, level, scene }: { data: BlockDataOf<"rich_text">; level: HeadingLevel; scene?: "privacy" | "cookie" }) {
  const [org, retention] = await Promise.all([getSetting("org"), getSetting("retention")]);
  const html = renderRichHtml(data.html, { org, retention, site: { url: getSiteUrl() } });
  return (
    <>
      {scene && <LegalHero kind={scene} title={data.title} eyebrow={data.eyebrow || undefined} level={level} />}
      <Room tone="white" id={data.slot} className="pb-20 pt-10 sm:pb-28">
        <Wrap>
          <div className="mx-auto max-w-3xl">
            {!scene && <BlockHeading level={level} className="t-giant mb-10">{data.title}</BlockHeading>}
            {data.draftNotice && (
              <p role="note" className="cut cut-yellow mb-10 !p-5 text-[0.97rem] leading-snug">
                <strong className="font-bold">Testo in bozza.</strong> Questo testo è una base di lavoro e deve essere verificato con il titolare del trattamento e/o con un consulente legale prima di essere considerato definitivo.
              </p>
            )}
            <div className="pub-prose prose-it" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </Wrap>
      </Room>
    </>
  );
}
