import { Container, Eyebrow, Heading, Section } from "@/components/ui";

/** TECHNICAL placeholder: replaced by the owning module (see docs/CONVENTIONS.md). No invented content. */
export function PlaceholderPage({ title, eyebrow }: { title: string; eyebrow?: string }) {
  return (
    <Section>
      <Container>
        {eyebrow && <Eyebrow className="text-terracotta-deep">{eyebrow}</Eyebrow>}
        <Heading as="h1" size="display">{title}</Heading>
      </Container>
    </Section>
  );
}
