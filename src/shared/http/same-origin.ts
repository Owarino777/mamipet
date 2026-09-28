import { ForbiddenError } from "@/shared/errors/http-error";

export function assertSameOrigin(request: Request): void {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase())) return;
  const origin = request.headers.get("origin");
  if (
    request.headers.get("sec-fetch-site") === "cross-site" ||
    (origin && origin !== new URL(request.url).origin)
  ) {
    throw new ForbiddenError("Origine de la requête non autorisée.");
  }
}
