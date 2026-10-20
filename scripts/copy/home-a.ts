/** Copy overrides (slot -> partial block data) owned by HOME-A: hero, identita, contatti. */
import type { CopyPage } from "./types";

const copy: CopyPage = {
  hero: {
    eyebrow: "Castelvetrano, Valle del Belice",
    title: "Luoghi che tornano a vivere.",
    text: "Siamo una cooperativa sociale di Castelvetrano. Rimettiamo in uso i beni confiscati alla criminalità organizzata: ne facciamo posti per accogliere, giocare, lavorare, coltivare.",
    primaryCta: { label: "Entra nei luoghi", href: "/#luoghi" },
    secondaryCta: { label: "Chi siamo", href: "/chi-siamo" },
  },
  identita: {
    eyebrow: "Chi siamo",
    title: "Una cooperativa è una casa fatta di persone.",
    text: "Accogliamo persone, rimettiamo in uso i beni confiscati, facciamo giocare i ragazzi, coltiviamo biologico con ABES. Per noi fare impresa vuol dire anche prendersi cura della comunità.",
    cta: { label: "Conosci la cooperativa", href: "/chi-siamo" },
  },
  contatti: {
    title: "Le cose cambiano quando decidiamo di esserci.",
    text: "Vuoi conoscere il nostro lavoro, proporre una collaborazione o candidarti? Scrivici: la porta è aperta.",
    primaryCta: { label: "Scrivici", href: "/contatti" },
    secondaryCta: { label: "Lavora con noi", href: "/lavora-con-noi" },
  },
};

export default copy;
