import type { PostgrestError } from "@supabase/supabase-js";
import { HttpError } from "@/shared/errors/http-error";

export function throwIfSupabaseError(error: PostgrestError | null, message: string): void {
  if (!error) {
    return;
  }

  const expectedErrors: Record<string, { status: number; code: string }> = {
    "22023": { status: 422, code: "INVALID_INPUT" },
    "23505": { status: 409, code: "ALREADY_EXISTS" },
    "23514": { status: 409, code: "CONFLICT" },
    "42501": { status: 403, code: "FORBIDDEN" },
    P0002: { status: 404, code: "NOT_FOUND" },
  };
  const expected = expectedErrors[error.code];
  if (expected) {
    throw new HttpError(message, expected.status, expected.code);
  }

  throw new HttpError(message, 500, "SUPABASE_ERROR", {
    supabaseCode: error.code,
    hint: error.hint,
    details: error.details,
  });
}
