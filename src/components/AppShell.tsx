"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { tr } from "@/i18n/tr";
import type { SessionUser } from "@/lib/storage/types";

type Props = {
  user: SessionUser | null;
  onLogout?: () => void;
  children: ReactNode;
};

export function AppShell({ user, onLogout, children }: Props) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="brand-mark">{tr.brand}</span>
          <span className="brand-tag">{tr.tagline}</span>
        </Link>
        <div className="topbar-actions">
          {user ? (
            <>
              <span className="user-chip" title={user.username}>
                {user.username}
              </span>
              {onLogout ? (
                <button type="button" className="btn btn-ghost btn-compact" onClick={onLogout}>
                  {tr.logout}
                </button>
              ) : null}
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-compact">
                {tr.login}
              </Link>
              <Link href="/signup" className="btn btn-primary btn-compact">
                {tr.signup}
              </Link>
            </>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}
