import type { PostgrestError } from "@supabase/supabase-js";
import { HttpError } from "@/shared/errors/http-error";

export function throwIfSupabaseError(error: PostgrestError | null, message: string): void {
  if (!error) {
    return;
  }

  throw new HttpError(message, 500, "SUPABASE_ERROR", {
    supabaseCode: error.code,
    hint: error.hint,
    details: error.details,
  });
}
