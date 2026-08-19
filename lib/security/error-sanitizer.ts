import { NextResponse } from "next/server";

/**
 * Format a safe JSON error response that never leaks stack traces or internal secrets to clients.
 */
export function formatSafeErrorResponse(
  error: unknown,
  status = 500,
  contextMessage = "An unexpected error occurred while processing your request."
): NextResponse {
  const isDev = process.env.NODE_ENV === "development";
  const errorMessage = error instanceof Error ? error.message : String(error);

  // In development: include error message for developer ergonomics
  // In production: return sanitized user-friendly message
  const clientMessage = isDev && errorMessage ? errorMessage : contextMessage;

  console.error(`[SERVER_ERROR] [Status ${status}]:`, error);

  return NextResponse.json(
    {
      error: clientMessage,
      status,
    },
    { status }
  );
}
