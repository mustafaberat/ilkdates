import type { CSSProperties, ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";

import { tr } from "@/i18n/tr";

import "./globals.css";

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: tr.brand,
  description: tr.metaDescription,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6efe6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="tr" className={`${outfit.variable} ${fraunces.variable}`}>
      <body
        style={
          {
            "--font-sans": "var(--font-outfit), system-ui, sans-serif",
            "--font-serif": "var(--font-fraunces), Georgia, serif",
          } as CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
