import { DomainError } from "@/shared/errors/domain-error";
import { HttpError } from "@/shared/errors/http-error";
import { fail, ok } from "@/shared/http/api-response";

export function jsonOk<TData>(
  data: TData,
  init: ResponseInit = {},
  meta: Record<string, unknown> = {},
): Response {
  const headers = new Headers(init.headers);
  if (!headers.has("Cache-Control")) headers.set("Cache-Control", "private, no-store");
  return Response.json(ok(data, meta), { ...init, headers });
}

export function jsonCreated<TData>(data: TData): Response {
  return jsonOk(data, { status: 201 });
}

export function jsonError(error: unknown): Response {
  if (error instanceof HttpError) {
    const isServerError = error.status >= 500;
    return Response.json(fail(
      error.code,
      isServerError ? "An unexpected server error occurred." : error.message,
      isServerError ? undefined : error.details,
    ), {
      status: error.status,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  if (error instanceof DomainError) {
    return Response.json(fail(error.code, error.message), {
      status: 422,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  return Response.json(fail("INTERNAL_SERVER_ERROR", "Unexpected error."), {
    status: 500,
    headers: { "Cache-Control": "private, no-store" },
  });
}
