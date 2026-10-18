import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Hepta_Slab, Stardos_Stencil } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { getSiteUrl } from "@/lib/env";
import "./globals.css";

// Display: a heavy slab, the lettering of citrus crates and tin labels. Body: Atkinson Hyperlegible Next (designed for legibility).
// Stencil: only for small "stamped" labels (chapter numbers, dates).
const hepta = Hepta_Slab({ subsets: ["latin"], variable: "--font-hepta", weight: "variable", display: "swap" });
const atkinson = Atkinson_Hyperlegible_Next({ subsets: ["latin"], variable: "--font-atkinson", weight: "variable", display: "swap", adjustFontFallback: false });
const stardos = Stardos_Stencil({ subsets: ["latin"], variable: "--font-stardos", weight: ["400", "700"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "I Locandieri", template: "%s | I Locandieri" },
  applicationName: "I Locandieri",
};

export const viewport: Viewport = { themeColor: "#f7f1e1", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${hepta.variable} ${atkinson.variable} ${stardos.variable}`}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
