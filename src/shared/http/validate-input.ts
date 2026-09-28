import type { z } from "zod";
import { HttpError } from "@/shared/errors/http-error";

export function validateInput<T extends z.ZodTypeAny>(
  schema: T,
  value: unknown,
): z.infer<T> {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new HttpError("Données invalides.", 400, "VALIDATION_ERROR", {
      issues: result.error.issues,
    });
  return result.data;
}
