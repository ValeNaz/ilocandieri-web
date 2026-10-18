import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { getSiteUrl } from "@/lib/env";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["opsz", "SOFT"], display: "swap" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "I Locandieri", template: "%s | I Locandieri" },
  applicationName: "I Locandieri",
};

export const viewport: Viewport = { themeColor: "#fbf6ec", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${fraunces.variable} ${geist.variable}`}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
