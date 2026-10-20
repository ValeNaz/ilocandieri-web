import type { Metadata, Viewport } from "next";
import { Anybody, Hanken_Grotesk } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { getSiteUrl } from "@/lib/env";
import "./globals.css";

// Display: Anybody (variable weight AND width: headings can stretch and tighten, the type itself moves). Text: Hanken Grotesk.
const anybody = Anybody({ subsets: ["latin"], variable: "--font-anybody", weight: "variable", axes: ["wdth"], display: "swap" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", weight: "variable", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "I Locandieri", template: "%s | I Locandieri" },
  applicationName: "I Locandieri",
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" data-scroll-behavior="smooth" className={`${anybody.variable} ${hanken.variable}`}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
