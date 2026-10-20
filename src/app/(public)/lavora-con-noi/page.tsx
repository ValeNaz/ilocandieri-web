import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { EmptyDesk, TeamBeam, TradeField, TradeGarden, TradeKitchen, TradeOffice, TradeTeaching } from "@/components/public/art/lavora/Trades";
import { ApplicationForm } from "@/components/public/careers/ApplicationForm";
import "@/components/public/careers/careers.css";
import { Kinetic } from "@/components/public/kit/Kinetic";
import { Room, Wrap } from "@/components/public/kit/Room";
import { RealMedia } from "@/components/public/real/RealMedia";
import { APPLICATION_AREAS, CAREERS_FALLBACK_COPY as copy, CONFIRMATION_MESSAGE, NO_OPENINGS_MESSAGE } from "@/lib/careers/constants";
import { listPublicOpenings } from "@/lib/careers/admin";
import { FORM_SCOPE } from "@/lib/careers/submit";
import { findBlock, getPageBlocks, messageText } from "@/lib/content/queries";
import { paths } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";
import { FORM_TOKEN_FIELD, HONEYPOT_FIELD, issueFormToken } from "@/lib/security";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("lavora-con-noi", "/lavora-con-noi");
}

const TRADES = [
  { name: "Orto", Art: TradeGarden, cls: "col-span-1" },
  { name: "Campo", Art: TradeField, cls: "col-span-1" },
  { name: "Cucina", Art: TradeKitchen, cls: "col-span-1" },
  { name: "Ufficio", Art: TradeOffice, cls: "col-span-1" },
  { name: "Educazione", Art: TradeTeaching, cls: "col-span-2 sm:col-span-1" },
];

// Texts are editable in admin (page blocks with slots hero / collab / form / confirmation / no_openings).
// CAREERS_FALLBACK_COPY (dossier 05) is used only when a block is missing or hidden.
export default async function Page({ searchParams }: { searchParams: Promise<{ posizione?: string }> }) {
  const { posizione } = await searchParams;
  const [openings, content] = await Promise.all([listPublicOpenings(), getPageBlocks("lavora-con-noi")]);
  const hero = findBlock(content, "hero", "hero");
  const collab = findBlock(content, "collab");
  const formBlock = findBlock(content, "form");
  const formData = formBlock && "title" in formBlock.data ? (formBlock.data as { title: string; text?: string }) : null;
  const formTitle = formData?.title || copy.form.title;
  const formText = formData ? formData.text ?? "" : copy.form.text;
  const heroTitle = hero?.data.title || copy.hero.title;
  const heroText = hero ? hero.data.text : copy.hero.text;
  const collabTitle = collab && "title" in collab.data ? collab.data.title : copy.collaborations.title;
  const collabText = collab && "text" in collab.data ? collab.data.text : copy.collaborations.text;
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
      {/* 1. Hero: five trades, five people with their tools */}
      <Room tone="orange" className="pt-10 sm:pt-14">
        <Wrap>
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              {hero?.data.eyebrow && <p className="t-label text-[var(--c-ink)]">{hero.data.eyebrow}</p>}
              <Kinetic as="h1" text={heroTitle} className="t-giant mt-3" />
            </div>
            <div className="lg:col-span-5">
              {heroText && <p className="t-lead">{heroText}</p>}
              <div className="mt-6"><a href="#candidatura" className="pill pill-solid">{cta}<span className="arrow" aria-hidden="true">→</span></a></div>
            </div>
          </div>
        </Wrap>
        <Wrap className="mt-10 sm:mt-14">
          <ul className="grid grid-cols-2 items-end sm:grid-cols-5" aria-label="Mestieri">
            {TRADES.map((t, i) => (
              <li key={t.name} className={cn("pop flex flex-col", t.cls)}>
                <div className="mx-auto aspect-[300/420] w-full max-w-[17rem]" style={{ marginBottom: "-1px" }}><t.Art /></div>
                <p className={cn("cf-trade bg-[var(--c-white)] py-4 text-center", i === 0 && "rounded-tl-[1.75rem]", i === TRADES.length - 1 && "rounded-tr-[1.75rem]")}>{t.name}</p>
              </li>
            ))}
          </ul>
        </Wrap>
      </Room>

      {/* 2. Collaborations */}
      <Room tone="green" id="collaborazioni" className="py-20 sm:py-28" aria-labelledby="collaborazioni-titolo">
        <Wrap>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 id="collaborazioni-titolo" className="t-scene">{collabTitle}</h2>
              {collabText && <p className="t-body mt-6">{collabText}</p>}
              <RealMedia id="lavora-squadra" className="mt-10 w-full" deco={["sun", "birds"]} />
            </div>
            <ul className="lg:col-span-7" aria-label="Ambiti di collaborazione">
              {APPLICATION_AREAS.map((a, i) => (
                <li key={a} className="flex items-baseline gap-4 border-t-2 border-[var(--c-white)] py-3 first:border-t-0">
                  <span className="cf-area w-8 shrink-0" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <span className="cf-area">{a}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mx-auto mt-14 aspect-[760/260] w-full max-w-[56rem]"><TeamBeam /></div>
        </Wrap>
      </Room>

      {/* 3. Open positions */}
      <Room tone="yellow" className="py-20 sm:py-28" aria-labelledby="posizioni">
        <Wrap>
          <h2 id="posizioni" className="t-scene">Posizioni aperte</h2>
          {openings.length === 0 ? (
            <div className="cf-panel-a mt-10 grid items-center gap-8 bg-[var(--c-white)] p-7 sm:p-12 lg:grid-cols-[1fr_20rem]">
              <p className="t-lead">{noOpenings}</p>
              <div className="mx-auto aspect-[360/240] w-full max-w-[20rem]"><EmptyDesk /></div>
            </div>
          ) : (
            <ul className="mt-10">
              {openings.map((o) => (
                <li key={o.id} className="cf-row grid gap-4 py-8 lg:grid-cols-12 lg:gap-10">
                  <h3 className="t-head lg:col-span-5">{o.title}</h3>
                  <div className="lg:col-span-7">
                    {o.description && <p className="t-body whitespace-pre-line">{o.description}</p>}
                    <a href={`?posizione=${encodeURIComponent(o.slug)}#candidatura`} className="pill pill-line mt-5">
                      Candidati per questa posizione<span className="sr-only">: {o.title}</span><span className="arrow" aria-hidden="true">→</span>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Wrap>
      </Room>

      {/* 4. The form, in a light room */}
      <Room tone="white" id="candidatura" className="py-20 sm:py-28" aria-labelledby="modulo">
        <Wrap className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="modulo" className="t-scene">{formTitle}</h2>
            {formText && <p className="t-body mt-6">{formText}</p>}
            <ul className="t-body mt-8 grid gap-2 border-t-2 border-[var(--c-ink)] pt-6">
              <li><strong>Nome, cognome e email</strong>, per risponderti.</li>
              <li><strong>Ambito di interesse</strong>, dove ti vedi.</li>
              <li><strong>Un messaggio</strong>, in poche righe.</li>
              <li><strong>Il curriculum</strong>, se vuoi: PDF o Word, fino a 5 MB.</li>
            </ul>
          </div>
          <div className="rounded-[2rem] border-[3px] border-[var(--c-ink)] p-6 sm:p-10 lg:col-span-7">
            <ApplicationForm
              areas={APPLICATION_AREAS}
              openings={openings.map((o) => ({ id: o.id, title: o.title }))}
              defaultOpeningId={preselected}
              confirmation={confirmation}
              cta={cta}
              guard={guard}
            />
          </div>
        </Wrap>
      </Room>

      {/* 5. Closing */}
      <Room tone="yellow" className="py-16 sm:py-24">
        <Wrap className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h2 className="t-scene">Hai una domanda prima di scrivere?</h2>
            <p className="t-lead mt-5">Chiedi pure. Ti rispondiamo dai contatti della cooperativa.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={paths.contacts} className="pill pill-solid">Vai ai contatti<span className="arrow" aria-hidden="true">→</span></Link>
              <Link href={paths.welcome} className="pill pill-line">Come accogliamo<span className="arrow" aria-hidden="true">→</span></Link>
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="logo-build-view ml-auto w-fit rounded-[2.5rem] bg-[var(--c-white)] p-7 sm:p-9">
              <LogoMark className="h-auto w-24 sm:w-32 lg:w-36" />
            </div>
          </div>
        </Wrap>
      </Room>
    </>
  );
}
