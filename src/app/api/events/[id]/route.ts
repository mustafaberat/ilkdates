import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api";
import { deleteEvent, updateEvent } from "@/lib/db/event-repo";
import { requireUser } from "@/lib/auth/session";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const event = await updateEvent(user.id, id, body);
    return NextResponse.json({ event });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    await deleteEvent(user.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
