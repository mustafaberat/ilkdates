import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api";
import { createEvent, listEvents } from "@/lib/event-repo";
import { requireUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireUser();
    const events = await listEvents(user.id);
    return NextResponse.json({ events });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const event = await createEvent(user.id, body);
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
