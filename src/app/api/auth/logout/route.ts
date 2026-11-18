import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api";
import { DatabaseUnavailableError, isDatabaseConfigured } from "@/lib/db";
import { clearSessionCookie, destroySession } from "@/lib/session";

export async function POST() {
  try {
    if (!isDatabaseConfigured()) {
      await clearSessionCookie();
      return NextResponse.json({ ok: true });
    }
    await destroySession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      await clearSessionCookie();
      return NextResponse.json({ ok: true });
    }
    return handleRouteError(error);
  }
}
