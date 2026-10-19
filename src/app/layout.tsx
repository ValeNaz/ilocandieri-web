import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { getSiteUrl } from "@/lib/env";
import "./globals.css";

// Display: Bricolage Grotesque (contemporary grotesk with character, optical sizes). Text: Instrument Sans.
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", weight: "variable", axes: ["opsz"], display: "swap" });
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", weight: "variable", axes: ["wdth"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "I Locandieri", template: "%s | I Locandieri" },
  applicationName: "I Locandieri",
};

export const viewport: Viewport = { themeColor: "#fbf9f5", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${bricolage.variable} ${instrument.variable}`}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
