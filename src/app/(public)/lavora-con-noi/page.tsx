import type { Metadata } from "next";
import { ApplicationForm } from "@/components/public/careers/ApplicationForm";
import { Card, Container, Eyebrow, Heading, Pattern, Section, buttonClasses } from "@/components/ui";
import { APPLICATION_AREAS, CAREERS_FALLBACK_COPY as copy, CONFIRMATION_MESSAGE, NO_OPENINGS_MESSAGE } from "@/lib/careers/constants";
import { listPublicOpenings } from "@/lib/careers/admin";
import { FORM_SCOPE } from "@/lib/careers/submit";
import { FORM_TOKEN_FIELD, HONEYPOT_FIELD, issueFormToken } from "@/lib/security";
import { PageBlocks } from "@/components/public/blocks";
import { findBlock, getPageBlocks, messageText } from "@/lib/content/queries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("lavora-con-noi", "/lavora-con-noi");
}

// Texts are editable in admin (page blocks with slots hero / collab / form / confirmation / no_openings).
// CAREERS_FALLBACK_COPY (dossier 05) is used only when a block is missing or hidden.
export default async function Page({ searchParams }: { searchParams: Promise<{ posizione?: string }> }) {
  const { posizione } = await searchParams;
  const [openings, content] = await Promise.all([listPublicOpenings(), getPageBlocks("lavora-con-noi")]);
  const hero = findBlock(content, "hero");
  const collab = findBlock(content, "collab");
  const formBlock = findBlock(content, "form");
  const formData = formBlock && "title" in formBlock.data ? (formBlock.data as { title: string; text?: string }) : null;
  const formTitle = formData?.title || copy.form.title;
  const formText = formData ? formData.text ?? "" : copy.form.text;
  const confirmation = messageText(content, "confirmation", CONFIRMATION_MESSAGE);
  const noOpenings = messageText(content, "no_openings", NO_OPENINGS_MESSAGE);
  const cta = findBlock(content, "form", "message")?.data.buttonLabel || copy.form.cta;
  const preselected = openings.find((o) => o.slug === posizione)?.id;

  const guard = (
    <>
      <input type="hidden" name={FORM_TOKEN_FIELD} value={issueFormToken(undefined, FORM_SCOPE)} />
      <div aria-hidden="true" className="sr-only">
        <label>
          Non compilare questo campo
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
    </>
  );

  return (
    <>
      {hero ? (
        <PageBlocks content={content} only={["hero"]} />
      ) : (
      <Section className="relative overflow-hidden pb-12 sm:pb-16">
        <Container className="grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="reveal">
            <Eyebrow className="text-terracotta-deep">Lavora con noi</Eyebrow>
            <Heading as="h1" size="display" className="max-w-3xl">{copy.hero.title}</Heading>
            <p className="mt-6 max-w-2xl text-lg text-ink-soft">{copy.hero.text}</p>
            <p className="mt-8">
              <a href="#candidatura" className={buttonClasses("primary", "md")}>
                {cta}
              </a>
            </p>
          </div>
          <Pattern variant="agrumi" className="hidden aspect-[4/3] rounded-card shadow-card lg:block" />
        </Container>
        </Section>
      )}

      {collab ? (
        <PageBlocks content={content} only={["collab"]} firstIsH1={false} />
      ) : (
      <Section tone="deep" className="py-14 sm:py-20" aria-labelledby="collaborazioni">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <Heading id="collaborazioni" size="xl">{copy.collaborations.title}</Heading>
          <p className="text-lg text-ink-soft">{copy.collaborations.text}</p>
        </Container>
      </Section>
      )}

      <Section className="pb-0 sm:pb-0" aria-labelledby="posizioni">
        <Container>
          <Heading id="posizioni" size="lg" className="mb-6">Posizioni aperte</Heading>
          {openings.length === 0 ? (
            <p className="rounded-card border border-dashed border-line-strong/60 bg-card px-6 py-6 text-ink-soft">{noOpenings}</p>
          ) : (
            <ul className="grid gap-5 md:grid-cols-2">
              {openings.map((o) => (
                <li key={o.id}>
                  <Card tone="label" className="h-full p-6">
                    <h3 className="text-xl font-semibold">{o.title}</h3>
                    {o.description && <p className="mt-3 whitespace-pre-line text-ink-soft">{o.description}</p>}
                    <a href={`?posizione=${encodeURIComponent(o.slug)}#candidatura`} className="mt-5 inline-block font-medium text-terracotta-deep underline">
                      Candidati per questa posizione<span className="sr-only">: {o.title}</span>
                    </a>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>

      <Section id="candidatura" aria-labelledby="modulo">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <Heading id="modulo" size="xl">{formTitle}</Heading>
            <p className="mt-5 text-lg text-ink-soft">{formText}</p>
          </div>
          <Card tone="label" className="p-6 sm:p-9">
            <ApplicationForm
              areas={APPLICATION_AREAS}
              openings={openings.map((o) => ({ id: o.id, title: o.title }))}
              defaultOpeningId={preselected}
              confirmation={confirmation}
              cta={cta}
              guard={guard}
            />
          </Card>
        </Container>
      </Section>
    </>
  );
}
