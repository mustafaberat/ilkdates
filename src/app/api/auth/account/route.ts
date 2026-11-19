import { NextResponse } from "next/server";

import {
  accountDeleteSchema,
  accountUpdateSchema,
  deleteAccount,
  updateAccount,
} from "@/lib/auth";
import { errorResponse, handleRouteError } from "@/lib/api";
import { requireUser } from "@/lib/auth/session";

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return errorResponse("invalid_body");
    }
    const input = accountUpdateSchema.parse(body);
    const updated = await updateAccount(user.id, input);
    return NextResponse.json({ user: updated });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return errorResponse("invalid_body");
    }
    const input = accountDeleteSchema.parse(body);
    await deleteAccount(user.id, input.currentPassword);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
