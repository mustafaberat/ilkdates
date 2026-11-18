"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { tr } from "@/i18n/tr";
import { ApiError, loginRequest, signupRequest } from "@/lib/storage/remote";

type Mode = "login" | "signup";

type Props = {
  mode: Mode;
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isSignup = mode === "signup";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (isSignup) {
        await signupRequest(username, password);
      } else {
        await loginRequest(username, password);
      }
      router.push("/");
      router.refresh();
    } catch (caught) {
      const code = caught instanceof ApiError ? caught.code : "error_generic";
      setError(messageFor(code));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <Link href="/" className="btn btn-ghost btn-compact">
        ← {tr.backHome}
      </Link>
      <h1>{isSignup ? tr.signup : tr.login}</h1>
      <p className="lead">{isSignup ? tr.signupLead : tr.loginLead}</p>
      <form onSubmit={onSubmit}>
        <label className="field">
          <span>{tr.username}</span>
          <input
            name="username"
            autoComplete="username"
            required
            minLength={3}
            maxLength={32}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <span className="muted">{tr.usernameHint}</span>
        </label>
        <label className="field">
          <span>{tr.password}</span>
          <input
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <span className="muted">{tr.passwordHint}</span>
        </label>
        {error ? <p className="error-banner">{error}</p> : null}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {isSignup ? tr.signupSubmit : tr.loginSubmit}
        </button>
      </form>
      <p className="auth-switch">
        {isSignup ? tr.hasAccount : tr.noAccount}{" "}
        <Link href={isSignup ? "/login" : "/signup"}>
          {isSignup ? tr.login : tr.signup}
        </Link>
      </p>
    </main>
  );
}

function messageFor(code: string): string {
  switch (code) {
    case "invalid_credentials":
      return tr.invalidCredentials;
    case "username_taken":
      return tr.usernameTaken;
    case "invalid_username":
      return tr.invalidUsername;
    case "invalid_password":
      return tr.invalidPassword;
    case "auth_unavailable":
      return tr.authUnavailable;
    default:
      return tr.errorGeneric;
  }
}
