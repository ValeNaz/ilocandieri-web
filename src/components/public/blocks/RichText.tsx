import { Container, Section } from "@/components/ui";
import type { BlockDataOf } from "@/lib/content/blocks";
import { renderRichHtml } from "@/lib/content/rich";
import { getSetting } from "@/lib/settings";
import { getSiteUrl } from "@/lib/env";
import { BlockHeading, OptionalEyebrow, type HeadingLevel } from "./shared";

export async function RichTextBlock({ data, level }: { data: BlockDataOf<"rich_text">; level: HeadingLevel }) {
  const [org, retention] = await Promise.all([getSetting("org"), getSetting("retention")]);
  const html = renderRichHtml(data.html, { org, retention, site: { url: getSiteUrl() } });
  return (
    <Section id={data.slot} className="py-14 sm:py-20">
      <Container>
        <div className="mx-auto max-w-3xl">
          <OptionalEyebrow text={data.eyebrow} className="text-terracotta-deep" />
          <BlockHeading level={level} className="text-[clamp(2rem,4.8vw,3.4rem)] font-medium leading-[1.06]">{data.title}</BlockHeading>
          {data.draftNotice && (
            <p role="note" className="mt-8 rounded-control border border-warning/30 bg-warning-soft px-5 py-4 text-[0.95rem] text-warning">
              <strong className="font-semibold">Testo in bozza.</strong> Questo testo è una base di lavoro e deve essere verificato con il titolare del trattamento e/o con un consulente legale prima di essere considerato definitivo.
            </p>
          )}
          <div className="prose-it mt-10" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </Container>
    </Section>
  );
}
