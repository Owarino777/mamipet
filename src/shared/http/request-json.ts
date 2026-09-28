import { z } from "zod";
import { HttpError } from "@/shared/errors/http-error";
import { readLimitedBody } from "@/shared/http/read-limited-body";

export async function parseJsonBody<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema,
): Promise<z.infer<TSchema>> {
  let payload: unknown;

  try {
    payload = JSON.parse(new TextDecoder().decode(await readLimitedBody(request, 1024 * 1024)));
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError("Request body must be valid JSON.", 400, "INVALID_JSON");
  }

  const result = schema.safeParse(payload);

  if (!result.success) {
    throw new HttpError("Invalid request payload.", 400, "VALIDATION_ERROR", {
      issues: result.error.issues,
    });
  }

  return result.data;
}
