import { NextResponse } from "next/server";

import { credentialsSchema, login } from "@/lib/auth";
import { errorResponse, handleRouteError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return errorResponse("invalid_body");
    }
    const credentials = credentialsSchema.parse(body);
    const user = await login(credentials.username, credentials.password);
    return NextResponse.json({ user });
  } catch (error) {
    return handleRouteError(error);
  }
}
