import { Container, ButtonLink, Eyebrow, Heading, Pattern, Section } from "@/components/ui";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <>
      <Header />
      <main>
        <Section tone="terracotta" className="py-20 sm:py-32">
          <Container className="grid items-center gap-12 md:grid-cols-[1.2fr_1fr]">
            <div>
              <Eyebrow>Errore 404</Eyebrow>
              <Heading as="h1" size="display">Questa strada non porta da nessuna parte.</Heading>
              <p className="mt-6 max-w-lg text-lg">La pagina che cerchi non esiste più o non è mai esistita. Torna alla home oppure scrivici: ti aiutiamo volentieri.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/" variant="light">Torna alla home</ButtonLink>
                <ButtonLink href="/contatti" variant="secondary" className="border-paper text-paper hover:bg-paper hover:text-ink">Contattaci</ButtonLink>
              </div>
            </div>
            <Pattern variant="maiolica" className="aspect-square rounded-[2.5rem] border-[3px] border-ink" />
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
