import { EmptyState, ButtonLink, Container, Section } from "@/components/ui";
import { getPageBlocks } from "@/lib/content/queries";
import type { PageKey } from "@/lib/content/blocks";
import { paths } from "@/lib/paths";
import { PageBlocks } from "./index";

/** Standard institutional page: all visible blocks of `pageKey`, first title = <h1>. */
export async function PageView({ pageKey, after }: { pageKey: PageKey; after?: React.ReactNode }) {
  const content = await getPageBlocks(pageKey);
  const hasSections = content.blocks.some((b) => b.type !== "message");
  return (
    <>
      {hasSections ? (
        <PageBlocks content={content} />
      ) : (
        <Section>
          <Container>
            <h1 className="sr-only">{content.page?.title ?? "Pagina"}</h1>
            <EmptyState title="Contenuti in arrivo" description="Questa pagina sarà presto disponibile." action={<ButtonLink href={paths.home}>Torna alla home</ButtonLink>} />
          </Container>
        </Section>
      )}
      {after}
    </>
  );
}
