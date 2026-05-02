import { DomainError } from "@/shared/errors/domain-error";
import { HttpError } from "@/shared/errors/http-error";
import { fail, ok } from "@/shared/http/api-response";

export function jsonOk<TData>(
  data: TData,
  init: ResponseInit = {},
  meta: Record<string, unknown> = {},
): Response {
  return Response.json(ok(data, meta), init);
}

export function jsonCreated<TData>(data: TData): Response {
  return jsonOk(data, { status: 201 });
}

export function jsonError(error: unknown): Response {
  if (error instanceof HttpError) {
    return Response.json(fail(error.code, error.message, error.details), {
      status: error.status,
    });
  }

  if (error instanceof DomainError) {
    return Response.json(fail(error.code, error.message), {
      status: 422,
    });
  }

  if (error instanceof Error) {
    return Response.json(fail("INTERNAL_SERVER_ERROR", error.message), {
      status: 500,
    });
  }

  return Response.json(fail("INTERNAL_SERVER_ERROR", "Unexpected error."), {
    status: 500,
  });
}
