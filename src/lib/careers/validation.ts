import { z } from "zod";
import { APPLICATION_AREAS } from "./constants";

const clean = (s: string) => s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim();
const text = (label: string, max: number) =>
  z.string({ error: `${label} è obbligatorio.` }).transform(clean).pipe(z.string().min(1, `${label} è obbligatorio.`).max(max, `${label} è troppo lungo (massimo ${max} caratteri).`));

export const applicationSchema = z.object({
  firstName: text("Il nome", 80),
  lastName: text("Il cognome", 80),
  email: z
    .string({ error: "L'email è obbligatoria." })
    .transform(clean)
    .pipe(z.string().min(1, "L'email è obbligatoria.").max(200, "L'email è troppo lunga.").regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Inserisci un indirizzo email valido.")),
  phone: z
    .string()
    .optional()
    .transform((v) => clean(v ?? ""))
    .pipe(z.string().max(30, "Il telefono è troppo lungo.").regex(/^[+()\d\s./-]*$/, "Usa solo numeri, spazi e + ( ) - nel telefono.")),
  area: z.enum(APPLICATION_AREAS, { error: "Scegli un ambito di interesse." }),
  openingId: z.string().optional().transform((v) => clean(v ?? "")),
  message: text("Il messaggio", 4000).pipe(z.string().min(10, "Scrivi almeno qualche riga di presentazione (10 caratteri).")),
  privacy: z.literal("on", { error: "Per inviare la candidatura devi confermare di aver letto l'informativa privacy." }),
});
export type ApplicationInput = z.infer<typeof applicationSchema>;
