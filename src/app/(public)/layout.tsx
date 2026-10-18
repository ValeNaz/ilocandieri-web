import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";

// Public pages read editable content from the DB: render at request time.
export const dynamic = "force-dynamic";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#contenuto" className="sr-only-focusable fixed left-4 top-4 z-[200] rounded-full bg-ink px-5 py-3 text-paper focus:outline-offset-4">
        Vai al contenuto
      </a>
      <Header />
      <main id="contenuto" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
    </>
  );
}
