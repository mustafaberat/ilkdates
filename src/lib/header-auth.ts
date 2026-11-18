import type { SessionUser } from "@/lib/profile";

export type HeaderAuth = "member" | "guest" | "unknown";

/**
 * Resolve the header auth state for first paint and later updates.
 * `settled` means the client has finished reading / confirming the session.
 * Until then, prefer a known live user, otherwise the server-provided initial user.
 * After logout (`settled` + live user `null`) the header must show guest links,
 * even if the server snapshot is still stale.
 */
export function headerAuthState(
  user: SessionUser | null | undefined,
  settled: boolean,
  initial: SessionUser | null | undefined,
): HeaderAuth {
  const resolved = settled ? (user === undefined ? initial : user) : (user ?? initial);
  if (resolved === undefined) {
    return "unknown";
  }
  if (resolved === null) {
    return "guest";
  }
  return "member";
}
