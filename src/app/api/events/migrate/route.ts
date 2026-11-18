import { NextResponse } from "next/server";

import { errorResponse, handleRouteError } from "@/lib/api";
import { migrateEvents } from "@/lib/event-repo";
import { requireUser } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const incoming = Array.isArray(body?.events) ? body.events : null;
    if (!incoming) {
      return errorResponse("invalid_body");
    }
    const events = await migrateEvents(user.id, incoming);
    return NextResponse.json({ events });
  } catch (error) {
    return handleRouteError(error);
  }
}
