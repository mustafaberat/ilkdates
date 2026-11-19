import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "@/lib/db/schema";

export class DatabaseUnavailableError extends Error {
  status = 503;
  code = "auth_unavailable" as const;

  constructor() {
    super("DATABASE_URL missing");
    this.name = "DatabaseUnavailableError";
  }
}

export function databaseUrl(): string | null {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || null;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(databaseUrl());
}

export function getDb(): NeonHttpDatabase<typeof schema> {
  const url = databaseUrl();
  if (!url) {
    throw new DatabaseUnavailableError();
  }
  return drizzle(neon(url), { schema });
}

export function requireSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new DatabaseUnavailableError();
  }
  return secret;
}
