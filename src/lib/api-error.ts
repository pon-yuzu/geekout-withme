/**
 * Safe error response helper for API endpoints.
 * In production, returns a generic message to avoid leaking internal details.
 * In development, returns the actual error message for debugging.
 */
export function safeErrorResponse(
  error: unknown,
  genericMessage = 'An error occurred',
  status = 500,
): Response {
  const msg = error instanceof Error ? error.message : String(error);
  const isDev = import.meta.env.DEV;

  return new Response(
    JSON.stringify({ error: isDev ? msg : genericMessage }),
    { status, headers: { 'Content-Type': 'application/json' } },
  );
}
