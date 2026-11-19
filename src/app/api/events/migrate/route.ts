import { NextResponse } from "next/server";

import { errorResponse, handleRouteError } from "@/lib/api";
import { migrateEvents } from "@/lib/db/event-repo";
import { requireUser } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const incoming = Array.isArray(body?.events) ? body.events : null;
    if (!incoming) {
      return errorResponse("invalid_body");
    }
    const result = await migrateEvents(user.id, incoming);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
