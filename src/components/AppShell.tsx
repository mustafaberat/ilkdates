"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useInitialUser } from "@/components/SessionProvider";
import { formatWeekdayLong, tr } from "@/i18n/tr";
import { todayInTimeZone } from "@/lib/dates";
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
  const today = todayInTimeZone();

  return (
    <header className="mast">
      <div className="mast-inner">
        <p className="issue">{tr.issueLine}</p>
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
              <Link href="/kayit">{tr.signup}</Link>
            </>
          ) : null}
          {auth === "unknown" ? (
            <span className="nav-placeholder" aria-hidden="true" />
          ) : null}
        </nav>
      </div>
      <div className="deck">
        <p className="dateline">{formatWeekdayLong(today)}</p>
        <p className="motto">{tr.tagline}</p>
        <p className="folio">{tr.folio}</p>
      </div>
    </header>
  );
}

export function AppShell({ user, ready = true, children, showBanner = false }: Props) {
  const initial = useInitialUser();
  const auth = headerAuthState(user, ready, initial);
  const [before, after] = tr.guestBanner.split("kayıt ol");
  return (
    <div className="page">
      <SiteHeader user={user} ready={ready} />
      {showBanner && auth === "guest" ? (
        <div className="banner" role="status">
          <div className="banner-inner">
            <p>
              {before}
              <Link href="/kayit">kayıt ol</Link>
              {after}
            </p>
          </div>
        </div>
      ) : null}
      {children}
    </div>
  );
}
