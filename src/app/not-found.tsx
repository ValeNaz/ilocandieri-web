import { Container, ButtonLink, Eyebrow, Heading, Pattern, Section } from "@/components/ui";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import "@/components/public/journey.css";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <>
      <Header />
      <main>
        <Section className="py-20 sm:py-32">
          <Container className="grid items-center gap-12 md:grid-cols-[1.2fr_1fr]">
            <div>
              <Eyebrow>Errore 404</Eyebrow>
              <Heading as="h1" size="display">Questa strada non porta da nessuna parte.</Heading>
              <p className="mt-6 max-w-lg text-lg text-ink-soft">La pagina che cerchi non esiste più o non è mai esistita. Torna alla home oppure scrivici: ti aiutiamo volentieri.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/">Torna alla home</ButtonLink>
                <ButtonLink href="/contatti" variant="secondary">Contattaci</ButtonLink>
              </div>
            </div>
            <Pattern variant="agrumi" className="hidden aspect-square rounded-[1.75rem] md:block" />
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
