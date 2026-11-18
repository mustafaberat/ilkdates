import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { users } from "@/db/schema";
import { getDb } from "@/lib/db";
import { createSession, setSessionCookie, type SessionUser } from "@/lib/session";

const USERNAME_RE = /^[a-zA-Z0-9._-]{3,32}$/;
const BCRYPT_ROUNDS = 10;

export const credentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .regex(USERNAME_RE, "invalid_username"),
  password: z.string().min(8, "invalid_password").max(200, "invalid_password"),
});

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export async function signup(
  rawUsername: string,
  password: string,
): Promise<SessionUser> {
  const username = rawUsername.trim();
  const db = getDb();
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  try {
    const [user] = await db
      .insert(users)
      .values({
        username,
        usernameNormalized: normalizeUsername(username),
        passwordHash,
      })
      .returning();
    if (!user) {
      throw new Error("error_generic");
    }
    const token = await createSession(user.id);
    await setSessionCookie(token);
    return { id: user.id, username: user.username };
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new Error("username_taken");
    }
    throw error;
  }
}

export async function login(
  rawUsername: string,
  password: string,
): Promise<SessionUser> {
  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.usernameNormalized, normalizeUsername(rawUsername)))
    .limit(1);
  if (!user) {
    throw new Error("invalid_credentials");
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new Error("invalid_credentials");
  }
  const token = await createSession(user.id);
  await setSessionCookie(token);
  return { id: user.id, username: user.username };
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const record = error as { code?: string; message?: string };
  return (
    record.code === "23505" ||
    (typeof record.message === "string" &&
      record.message.toLowerCase().includes("unique"))
  );
}
