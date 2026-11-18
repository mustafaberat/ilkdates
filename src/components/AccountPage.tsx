"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { AppShell } from "@/components/AppShell";
import { useSessionEvents } from "@/hooks/useSessionEvents";
import { tr } from "@/i18n/tr";

export function AccountPage() {
  const session = useSessionEvents();
  const isGuest = !session.user;
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [closePassword, setClosePassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function flash(ok: string) {
    setError(null);
    setStatus(ok);
  }

  function fail(code: string) {
    setStatus(null);
    setError(messageFor(code));
  }

  async function changePassword(ev: FormEvent) {
    ev.preventDefault();
    try {
      await session.updateAccount({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      flash(tr.passwordUpdated);
    } catch (caught) {
      fail(caught instanceof Error ? caught.message : "error_generic");
    }
  }

  async function closeAccount(ev: FormEvent) {
    ev.preventDefault();
    if (!window.confirm(tr.closeAccountConfirm)) {
      return;
    }
    try {
      await session.deleteAccount(closePassword);
      setClosePassword("");
      flash(tr.closeAccount);
    } catch (caught) {
      fail(caught instanceof Error ? caught.message : "error_generic");
    }
  }

  function exportJson() {
    const payload = {
      exportedAt: new Date().toISOString(),
      username: session.user?.username ?? null,
      events: session.events,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "ilkdates.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(href);
  }

  return (
    <AppShell user={session.user} ready={session.ready}>
      <main className="wrap">
        <div className="hesap">
          <nav className="sidenav">
            <a href="#profil">{tr.profile}</a>
            {isGuest ? null : <a href="#sifre">{tr.passwordSection}</a>}
            <a href="#veri">{tr.dataSection}</a>
            <Link href="/">{tr.backHome}</Link>
            {isGuest ? null : (
              <a className="danger" href="#kapat">
                {tr.dangerZone}
              </a>
            )}
          </nav>
          <div className="settings">
            <h1>{tr.accountTitle}</h1>
            <p className="lead">{isGuest ? tr.accountGuestLead : tr.accountLead}</p>
            {isGuest ? (
              <p className="notice">
                {tr.guestAccountPrompt}{" "}
                <Link href="/kayit">{tr.signup}</Link>
                {" · "}
                <Link href="/giris">{tr.login}</Link>
              </p>
            ) : null}
            {status ? <p className="notice">{status}</p> : null}
            {error ? <p className="error-banner">{error}</p> : null}

            <section className="block" id="profil">
              <h2>{tr.profile}</h2>
              {session.user ? (
                <div className="row">
                  <label>{tr.username}</label>
                  <div>
                    <div className="box">{session.user.username}</div>
                  </div>
                </div>
              ) : (
                <p className="desc">{tr.accountGuestLead}</p>
              )}
            </section>

            {isGuest ? null : (
              <form className="block" id="sifre" onSubmit={changePassword}>
                <h2>{tr.passwordSection}</h2>
                <div className="row">
                  <label htmlFor="currentPassword">{tr.currentPassword}</label>
                  <input
                    id="currentPassword"
                    className="box"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(ev) => setCurrentPassword(ev.target.value)}
                    required
                  />
                </div>
                <div className="row">
                  <label htmlFor="newPassword">{tr.newPassword}</label>
                  <input
                    id="newPassword"
                    className="box"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    placeholder={tr.newPasswordPlaceholder}
                    value={newPassword}
                    onChange={(ev) => setNewPassword(ev.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-fill" disabled={session.busy}>
                  {tr.updatePassword}
                </button>
              </form>
            )}

            <section className="block" id="veri">
              <h2>{tr.dataSection}</h2>
              <p className="desc">{tr.exportJson}</p>
              <button type="button" className="btn-line" onClick={exportJson}>
                {tr.exportJson}
              </button>
              {isGuest ? null : (
                <button
                  type="button"
                  className="btn-line"
                  style={{ marginLeft: 8 }}
                  onClick={() => void session.logout()}
                >
                  {tr.logout}
                </button>
              )}
            </section>

            {isGuest ? null : (
              <form className="block danger-zone" id="kapat" onSubmit={closeAccount}>
                <h2>{tr.dangerZone}</h2>
                <p className="desc">{tr.closeAccountHint}</p>
                <div className="row">
                  <label htmlFor="closePassword">{tr.currentPassword}</label>
                  <input
                    id="closePassword"
                    className="box"
                    type="password"
                    autoComplete="current-password"
                    value={closePassword}
                    onChange={(ev) => setClosePassword(ev.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-danger" disabled={session.busy}>
                  {tr.closeAccountButton}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </AppShell>
  );
}

function messageFor(code: string): string {
  switch (code) {
    case "invalid_credentials":
      return tr.invalidCredentials;
    case "account_closed":
      return tr.accountClosed;
    case "invalid_password":
      return tr.invalidPassword;
    default:
      return tr.errorGeneric;
  }
}
