import { NextResponse } from "next/server";

import { isDatabaseConfigured } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ user: null });
  }
  try {
    const user = await getSessionUser();
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
