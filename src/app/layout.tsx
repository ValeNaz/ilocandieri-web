import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { getSiteUrl } from "@/lib/env";
import "./globals.css";

// One clean grotesk for titles and text: hierarchy comes from size and weight.
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", weight: "variable", axes: ["wdth"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "I Locandieri", template: "%s | I Locandieri" },
  applicationName: "I Locandieri",
};

export const viewport: Viewport = { themeColor: "#fbf9f5", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={instrument.variable}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
