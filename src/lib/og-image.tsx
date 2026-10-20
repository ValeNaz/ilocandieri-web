import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

/** Shared Open Graph card (1200x630): white page, the original logo, the title, the logo colours as a band. */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_TYPE = "image/png";

let logo: string | null = null;
let font: Buffer | null = null;
async function assets() {
  logo ??= `data:image/png;base64,${(await readFile(path.join(process.cwd(), "public/brand/logo-512.png"))).toString("base64")}`;
  font ??= await readFile(path.join(process.cwd(), "src/lib/fonts/anybody-800.ttf")); // Anybody 800 (SIL OFL), the site's display face
  return { src: logo, font };
}

export async function ogImage({ title, kicker }: { title: string; kicker?: string }) {
  const { src, font } = await assets();
  const size = title.length > 70 ? 54 : title.length > 40 ? 64 : 76;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#ffffff", color: "#1d1d1b", fontFamily: "Anybody" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 56, padding: "56px 72px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- satori */}
          <img src={src} width={220} height={220} alt="" />
          <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#0a7d5f", letterSpacing: 3, textTransform: "uppercase" }}>{kicker ?? "I Locandieri · Castelvetrano"}</div>
            <div style={{ fontSize: size, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1 }}>{title}</div>
          </div>
        </div>
        <div style={{ display: "flex", height: 28 }}>
          <div style={{ flex: 1, background: "#f16842" }} /><div style={{ flex: 1, background: "#f1cc26" }} /><div style={{ flex: 1, background: "#0a7d5f" }} />
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: "Anybody", data: font, weight: 800, style: "normal" }] },
  );
}
