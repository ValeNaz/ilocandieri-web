import "@/components/public/kit/kit.css";
import Link from "next/link";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { LostHero } from "@/components/public/liste/PageHeroes";
import { paths } from "@/lib/paths";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="contenuto">
        <LostHero
          eyebrow="Errore 404"
          title="Questa strada non porta a nessuna pagina."
          text="L'indirizzo non esiste più o non è mai esistito. Torna alla home, oppure scrivici: ti aiutiamo volentieri."
          actions={<>
            <Link href={paths.home} className="pill pill-solid">Torna alla home <span className="arrow" aria-hidden="true">→</span></Link>
            <Link href={paths.contacts} className="pill pill-line">Contattaci</Link>
          </>}
        />
      </main>
      <Footer />
    </>
  );
}
