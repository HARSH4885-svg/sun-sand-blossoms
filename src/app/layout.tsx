import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "Best Outfit · IIITA Freshers Party 2026 · Sun, Sand & Blossoms",
  description:
    "Submit your look for the IIITA Freshers Party 2026 Best Outfit competition. Theme: Sun, Sand & Blossoms.",
  openGraph: {
    title: "Your Look. Your Moment. · IIITA Freshers 2026",
    description: "Step into the sunshine. Bring your style to the bloom.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#FFF9F0", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-cocoa focus:px-5 focus:py-3 focus:text-ivory"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
