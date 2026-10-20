import type { PageKey } from "../../src/lib/content/blocks";
import about from "./about";
import contatti from "./contatti";
import eventi from "./eventi";
import home from "./home";
import lavora from "./lavora";
import news from "./news";
import shop from "./shop";
import type { CopyPage } from "./types";

/** Editorial copy by page and block slot. Overrides win over the original dossier copy in scripts/seed/10-content.ts. */
export const COPY: Partial<Record<PageKey, CopyPage>> = {
  home,
  "chi-siamo": about,
  shop,
  eventi,
  news,
  "lavora-con-noi": lavora,
  contatti,
};
