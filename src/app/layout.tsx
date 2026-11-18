import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Courier_Prime, EB_Garamond } from "next/font/google";

import { SessionProvider } from "@/components/SessionProvider";
import { tr } from "@/i18n/tr";
import { getSessionUser } from "@/lib/session";
import { siteUrl } from "@/lib/site";

import "./globals.css";

const serif = EB_Garamond({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  weight: ["500", "600"],
  variable: "--font-serif",
  display: "swap",
});

const mono = Courier_Prime({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--font-mono",
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
  themeColor: "#F3EBDD",
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
    <html lang="tr" className={`${serif.variable} ${mono.variable}`}>
      <body>
        <SessionProvider initialUser={initialUser}>{children}</SessionProvider>
      </body>
    </html>
  );
}
