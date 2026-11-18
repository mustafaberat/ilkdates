import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";

import { sessions, users, type UserRow } from "@/db/schema";
import { hashToken, newToken } from "@/lib/crypto";
import { getDb } from "@/lib/db";

export const SESSION_COOKIE = "ilkdates_session";
const SESSION_DAYS = 30;

export type SessionUser = {
  id: string;
  username: string;
};

function publicUser(row: UserRow): SessionUser {
  return { id: row.id, username: row.username };
}

export function sessionExpiryDate(from = new Date()): Date {
  return new Date(from.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
}

export async function createSession(userId: string): Promise<string> {
  const token = newToken();
  const db = getDb();
  await db.insert(sessions).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt: sessionExpiryDate(),
  });
  return token;
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: sessionExpiryDate(),
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function readSessionToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await readSessionToken();
  if (!token) {
    return null;
  }
  const db = getDb();
  const tokenHash = hashToken(token);
  const rows = await db
    .select({ user: users, sessionId: sessions.id })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
    .limit(1);
  const row = rows[0];
  return row ? publicUser(row.user) : null;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("unauthorized");
  }
  return user;
}

export async function destroySession(): Promise<void> {
  const token = await readSessionToken();
  if (token) {
    const db = getDb();
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }
  await clearSessionCookie();
}
