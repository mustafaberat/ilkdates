"use client";

import Link from "next/link";

import { tr } from "@/i18n/tr";

export function GuestBanner() {
  return (
    <div className="banner" role="status">
      <p>{tr.guestBanner}</p>
      <Link href="/signup">{tr.guestBannerCta}</Link>
    </div>
  );
}
