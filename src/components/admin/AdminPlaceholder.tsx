import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "./PageHeader";

/** TECHNICAL placeholder for sections owned by other modules (replace the whole page). */
export function AdminPlaceholder({ title, description, module }: { title: string; description: string; module: string }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <EmptyState title="Sezione in preparazione" description={`Questa sezione sarà disponibile a breve (modulo ${module}).`} />
    </>
  );
}
