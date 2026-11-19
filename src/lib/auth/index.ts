import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { users } from "@/lib/db/schema";
import { getDb } from "@/lib/db";
import { type SessionUser } from "@/lib/domain/profile";
import {
  createSession,
  destroyAllSessionsForUser,
  publicUser,
  setSessionCookie,
} from "@/lib/auth/session";

const USERNAME_RE = /^[a-zA-Z0-9._-]{3,32}$/;
const BCRYPT_ROUNDS = 10;

export const credentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .regex(USERNAME_RE, "invalid_username"),
  password: z.string().min(8, "invalid_password").max(200, "invalid_password"),
});

export const accountUpdateSchema = z
  .object({
    currentPassword: z.string().min(1, "invalid_credentials").max(200),
    username: z
      .string()
      .trim()
      .regex(USERNAME_RE, "invalid_username")
      .optional(),
    newPassword: z.union([
      z.literal(""),
      z.string().min(8, "invalid_password").max(200, "invalid_password"),
    ]).optional(),
  })
  .transform((value) => ({
    currentPassword: value.currentPassword,
    username: value.username,
    newPassword:
      value.newPassword && value.newPassword.length > 0
        ? value.newPassword
        : undefined,
  }))
  .refine((value) => Boolean(value.username || value.newPassword), {
    message: "invalid_body",
  });

export const accountDeleteSchema = z.object({
  currentPassword: z.string().min(1, "invalid_credentials").max(200),
});



export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

async function loadUserById(userId: string) {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user ?? null;
}

async function assertPassword(userId: string, password: string) {
  const user = await loadUserById(userId);
  if (!user) {
    throw new Error("unauthorized");
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new Error("invalid_credentials");
  }
  return user;
}

export async function signup(
  rawUsername: string,
  password: string,
): Promise<SessionUser> {
  const username = rawUsername.trim();
  const db = getDb();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.usernameNormalized, normalizeUsername(username)))
    .limit(1);
  if (existing) {
    throw new Error("username_taken");
  }
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
    return publicUser(user);
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
  if (user.active === false) {
    throw new Error("account_closed");
  }
  const token = await createSession(user.id);
  await setSessionCookie(token);
  return publicUser(user);
}

export async function updateAccount(
  userId: string,
  input: z.infer<typeof accountUpdateSchema>,
): Promise<SessionUser> {
  const user = await assertPassword(userId, input.currentPassword);
  const db = getDb();
  const patch: { username?: string; usernameNormalized?: string; passwordHash?: string } = {};

  if (input.username && normalizeUsername(input.username) !== user.usernameNormalized) {
    patch.username = input.username.trim();
    patch.usernameNormalized = normalizeUsername(input.username);
  }
  if (input.newPassword) {
    patch.passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);
  }
  if (Object.keys(patch).length === 0) {
    return publicUser(user);
  }

  try {
    const [updated] = await db
      .update(users)
      .set(patch)
      .where(eq(users.id, userId))
      .returning();
    if (!updated) {
      throw new Error("error_generic");
    }
    return publicUser(updated);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new Error("username_taken");
    }
    throw error;
  }
}

export async function deleteAccount(userId: string, currentPassword: string): Promise<void> {
  await assertPassword(userId, currentPassword);
  const db = getDb();
  await db.update(users).set({ active: false }).where(eq(users.id, userId));
  await destroyAllSessionsForUser(userId);
}

function isUniqueViolation(error: unknown): boolean {
  const seen = new Set<unknown>();
  const walk = (value: unknown): boolean => {
    if (!value || typeof value !== "object" || seen.has(value)) {
      return false;
    }
    seen.add(value);
    const record = value as { code?: string; message?: string; cause?: unknown };
    if (record.code === "23505") {
      return true;
    }
    const message = `${record.message ?? ""} ${String(value)}`.toLowerCase();
    if (message.includes("unique") || message.includes("23505")) {
      return true;
    }
    return walk(record.cause);
  };
  return walk(error);
}
