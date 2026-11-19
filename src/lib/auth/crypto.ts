import { createHmac, randomBytes } from "crypto";

import { requireSessionSecret } from "@/lib/db";

export function newToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return createHmac("sha256", requireSessionSecret()).update(token).digest("hex");
}
