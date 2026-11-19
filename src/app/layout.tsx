import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Archivo, Newsreader } from "next/font/google";

import { SessionProvider } from "@/components/layout/SessionProvider";
import { tr } from "@/i18n/tr";
import { getSessionUser } from "@/lib/auth/session";
import { siteUrl } from "@/lib/site";

import "./globals.css";

const serif = Newsreader({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  weight: "variable",
  variable: "--font-serif",
  display: "swap",
});

const sans = Archivo({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  variable: "--font-sans",
  display: "swap",
});

const url = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: {
    default: tr.metaTitle,
    template: `%s · ${tr.brand}`,
  },
  description: tr.metaDescription,
  applicationName: tr.brand,
  openGraph: {
    title: tr.metaTitle,
    description: tr.metaDescription,
    locale: "tr_TR",
    type: "website",
    url,
    siteName: tr.brand,
  },
  twitter: {
    card: "summary_large_image",
    title: tr.metaTitle,
    description: tr.metaDescription,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ece6d6",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  let initialUser: Awaited<ReturnType<typeof getSessionUser>> | undefined;
  try {
    initialUser = await getSessionUser();
  } catch {
    initialUser = undefined;
  }
  return (
    <html lang="tr" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <SessionProvider initialUser={initialUser}>{children}</SessionProvider>
      </body>
    </html>
  );
}
