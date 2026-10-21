import { useId, type ReactNode } from "react";
import { paths } from "@/lib/paths";
import { C, INK } from "../parts";

/**
 * Tiny scenes for the panel rows, same hand as the hero: a pale cream disc, flat logo colours, soft hills cut by the
 * disc, ink only for small details. 52x52 viewBox; purely decorative (the row's text says it all).
 */
const CREAM = "color-mix(in oklab, var(--c-yellow) 22%, var(--c-white))";
const LEAF = "color-mix(in oklab, var(--c-green) 55%, var(--c-white))";

const hill = (d: string, fill: string = C.green) => <path d={d} fill={fill} />;
const groundLow = hill("M0 40 C10 34 20 33 30 36 C38 38 45 36 52 33 L52 52 L0 52 Z");

const ICONS: Record<string, ReactNode | ((id: string) => ReactNode)> = {
  // Luoghi: a pin on two hills
  [paths.places]: (
    <>
      {hill("M0 41 C8 33 18 32 28 39 L28 52 L0 52 Z", LEAF)}
      {hill("M14 52 C20 40 34 35 52 40 L52 52 Z")}
      <path d="M26 35 C19.5 27.5 16.5 22.5 16.5 18.5 A9.5 9.5 0 0 1 35.5 18.5 C35.5 22.5 32.5 27.5 26 35 Z" fill={C.yellow} />
      <circle cx="26" cy="18.6" r="4" fill={C.orange} />
    </>
  ),
  // Il Giardino delle Arance: an orange with two leaves, rising from a small green hill
  [paths.placeGarden]: (
    <>
      {groundLow}
      <path d="M26 13.6 C33.9 13.2 40.4 19.6 40.2 27.4 C40 35.6 33.6 41.6 25.7 41.4 C17.8 41.2 11.6 35 11.8 27.1 C12 19.4 18.2 14 26 13.6 Z" fill={C.orange} />
      <path d="M17.6 24.4 C18.6 20.6 21.6 18.4 25 18" fill="none" stroke={C.white} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M26 14 L26.6 9.6" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      <path d="M26.4 10.6 C29.6 6.2 35 5.4 38.6 7.4 C35.8 11.4 30.8 12.6 26.4 10.6 Z" fill={C.green} />
      <path d="M25.6 11 C22.8 7.4 18 6.8 15 8.8 C17.6 12 22 12.8 25.6 11 Z" fill={C.green} />
    </>
  ),
  // Campo Unità d'Italia: a football (centre pentagon, rim pentagons cut by the ball) over a hill with a second swell
  [paths.placeField]: (id) => (
    <>
      {hill("M0 41 C9 35 18 34 26 38 C33 41 41 34 52 36 L52 52 L0 52 Z")}
      <clipPath id={`${id}-ball`}><circle cx="26" cy="23.5" r="11.5" /></clipPath>
      <circle cx="26" cy="23.5" r="11.5" fill={C.white} />
      <g clipPath={`url(#${id}-ball)`}>
        <polygon points="26.00,20.00 29.33,22.42 28.06,26.33 23.94,26.33 22.67,22.42" fill={C.ink} />
        <polygon points="26.00,14.90 22.58,12.41 23.88,8.39 28.12,8.39 29.42,12.41" fill={C.ink} /><polygon points="34.18,20.84 35.49,16.82 39.72,16.82 41.03,20.84 37.60,23.33" fill={C.ink} /><polygon points="31.05,30.46 35.29,30.46 36.59,34.48 33.17,36.97 29.75,34.48" fill={C.ink} /><polygon points="20.95,30.46 22.25,34.48 18.83,36.97 15.41,34.48 16.71,30.46" fill={C.ink} /><polygon points="17.82,20.84 14.40,23.33 10.97,20.84 12.28,16.82 16.51,16.82" fill={C.ink} />
        <path d="M26.00 20.00 L26.00 14.60 M29.33 22.42 L34.46 20.75 M28.06 26.33 L31.23 30.70 M23.94 26.33 L20.77 30.70 M22.67 22.42 L17.54 20.75" stroke={C.ink} strokeWidth="1.1" />
      </g>
      <circle cx="26" cy="23.5" r="11.5" fill="none" stroke={C.ink} strokeWidth={INK.fine} />
    </>
  ),
  // Chi siamo
  [paths.about]: (
    <>
      {groundLow}
      <path d="M15 38 L15 25 L26 16 L37 25 L37 38 Z" fill={C.white} stroke={C.ink} strokeWidth={INK.fine} strokeLinejoin="round" />
      <path d="M12 26.5 L26 14.5 L40 26.5" fill="none" stroke={C.orange} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="22.5" y="29" width="7" height="9" rx="1.5" fill={C.green} />
    </>
  ),
  [paths.history]: (
    <>
      {groundLow}
      <path d="M12 40 L12 25 A14 14 0 0 1 40 25 L40 40 Z" fill={C.orange} />
      <path d="M19 40 L19 27 A7 7 0 0 1 33 27 L33 40 Z" fill={C.white} stroke={C.ink} strokeWidth={INK.fine} />
      <path d="M26 22 l0 6 l3.5 2" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" fill="none" />
    </>
  ),
  [paths.welcome]: (
    <>
      {groundLow}
      <rect x="13" y="20" width="26" height="18" rx="4" fill={C.orange} />
      <path d="M21 20 L21 16 Q21 14 23 14 L29 14 Q31 14 31 16 L31 20" fill="none" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      <path d="M13 27 L39 27" stroke={C.yellow} strokeWidth="2.6" />
    </>
  ),
  [paths.careers]: (
    <>
      {groundLow}
      <path d="M30 10 L30 31" stroke={C.ink} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M24 31 L36 31 L34 40 Q30 43 26 40 Z" fill={C.orange} />
      <path d="M16 33 C16 27 20 24 23 26 C21 29 19 31 16 33 Z" fill={C.green} />
    </>
  ),
  // Terra
  [paths.tradition]: (
    <>
      {groundLow}
      <path d="M26 42 L26 10" stroke={C.green} strokeWidth="2.4" strokeLinecap="round" />
      {[12, 18, 24, 30].map((y) => (
        <g key={y}>
          <ellipse cx="21.6" cy={y + 1} rx="2.6" ry="4.6" transform={`rotate(-28 21.6 ${y + 1})`} fill={C.yellow} stroke={C.ink} strokeWidth="1.2" />
          <ellipse cx="30.4" cy={y + 1} rx="2.6" ry="4.6" transform={`rotate(28 30.4 ${y + 1})`} fill={C.yellow} stroke={C.ink} strokeWidth="1.2" />
        </g>
      ))}
    </>
  ),
  [paths.abes]: (
    <>
      {groundLow}
      <rect x="17" y="17" width="18" height="23" rx="5" fill={C.orange} />
      <rect x="16" y="13" width="20" height="5" rx="2" fill={C.green} />
      <rect x="20" y="24" width="12" height="9" rx="2" fill={C.white} />
      <circle cx="26" cy="28.5" r="2.4" fill={C.yellow} />
    </>
  ),
  [paths.shop]: (
    <>
      {groundLow}
      <path d="M13 21 L39 21 L36 39 Q35 41 33 41 L19 41 Q17 41 16 39 Z" fill={C.yellow} stroke={C.ink} strokeWidth={INK.fine} strokeLinejoin="round" />
      <path d="M19 21 C19 13 33 13 33 21" fill="none" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      <circle cx="22" cy="19" r="3.6" fill={C.orange} /><circle cx="29" cy="18.5" r="3.6" fill={C.orange} />
    </>
  ),
};

export function NavIcon({ href, className }: { href: string; className?: string }) {
  const clip = useId();
  const entry = ICONS[href];
  if (!entry) return null;
  const art = typeof entry === "function" ? entry(clip) : entry;
  return (
    <svg viewBox="0 0 52 52" className={className} aria-hidden="true" focusable="false">
      <defs><clipPath id={clip}><circle cx="26" cy="26" r="26" /></clipPath></defs>
      <circle cx="26" cy="26" r="26" fill={CREAM} />
      <g clipPath={`url(#${clip})`}>{art}</g>
    </svg>
  );
}
