"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useInitialUser } from "@/components/SessionProvider";
import { tr } from "@/i18n/tr";
import { headerAuthState } from "@/lib/header-auth";
import type { SessionUser } from "@/lib/profile";

type Props = {
  user?: SessionUser | null;
  ready?: boolean;
  children: ReactNode;
  showBanner?: boolean;
};

export function Wordmark() {
  return (
    <Link href="/" className="brand">
      <em>ilk</em>dates
    </Link>
  );
}

export function SiteHeader({
  user,
  ready = true,
}: {
  user?: SessionUser | null;
  ready?: boolean;
}) {
  const initial = useInitialUser();
  const auth = headerAuthState(user, ready, initial);
  const pathname = usePathname();
  const onCalendar = pathname === "/";
  const onAccount = pathname === "/hesap" || Boolean(pathname?.startsWith("/hesap"));

  return (
    <header className="nav">
      <div className="nav-inner">
        <Wordmark />
        <nav className="nav-links">
          <Link href="/" className={onCalendar ? "is-on" : undefined}>
            {tr.calendar}
          </Link>
          <Link href="/hesap" className={onAccount ? "is-on" : undefined}>
            {tr.account}
          </Link>
          {auth === "guest" ? (
            <>
              <Link href="/giris">{tr.login}</Link>
              <Link href="/kayit" className="btn">
                {tr.signup}
              </Link>
            </>
          ) : null}
          {auth === "unknown" ? (
            <span className="nav-placeholder" aria-hidden="true" />
          ) : null}
        </nav>
      </div>
    </header>
  );
}

export function AppShell({ user, ready = true, children, showBanner = false }: Props) {
  const initial = useInitialUser();
  const auth = headerAuthState(user, ready, initial);
  return (
    <div className="page">
      <SiteHeader user={user} ready={ready} />
      {showBanner && auth === "guest" ? (
        <div className="banner" role="status">
          <div className="banner-inner">
            <p>{tr.guestBanner}</p>
            <Link href="/kayit">{tr.guestBannerCta}</Link>
          </div>
        </div>
      ) : null}
      {children}
    </div>
  );
}
