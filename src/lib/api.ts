import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { DatabaseUnavailableError } from "@/lib/db";

export type ApiErrorCode =
  | "invalid_credentials"
  | "username_taken"
  | "invalid_username"
  | "invalid_password"
  | "invalid_title"
  | "invalid_date"
  | "invalid_emoji"
  | "invalid_category"
  | "invalid_note"
  | "future_date"
  | "not_found"
  | "unauthorized"
  | "auth_unavailable"
  | "invalid_body"
  | "error_generic";

const STATUS: Record<ApiErrorCode, number> = {
  invalid_credentials: 401,
  username_taken: 409,
  invalid_username: 400,
  invalid_password: 400,
  invalid_title: 400,
  invalid_date: 400,
  invalid_emoji: 400,
  invalid_category: 400,
  invalid_note: 400,
  future_date: 400,
  not_found: 404,
  unauthorized: 401,
  auth_unavailable: 503,
  invalid_body: 400,
  error_generic: 500,
};

export function errorResponse(code: ApiErrorCode, status?: number) {
  return NextResponse.json({ error: code }, { status: status ?? STATUS[code] });
}

export function handleRouteError(error: unknown) {
  if (error instanceof DatabaseUnavailableError) {
    return errorResponse("auth_unavailable");
  }
  if (error instanceof ZodError) {
    const issue = error.issues[0];
    const code = (issue?.message ?? "invalid_body") as ApiErrorCode;
    if (code in STATUS) {
      return errorResponse(code);
    }
    return errorResponse("invalid_body");
  }
  if (error instanceof Error) {
    if (error.message in STATUS) {
      return errorResponse(error.message as ApiErrorCode);
    }
  }
  console.error(error);
  return errorResponse("error_generic");
}
