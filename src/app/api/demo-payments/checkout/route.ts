import { ConflictError } from "@/shared/errors/http-error";
import { jsonError } from "@/shared/http/route-response";

// Browser-owned demo amounts must never create a real charge.
export async function POST(): Promise<Response> {
  return jsonError(new ConflictError("Demo checkout is not available."));
}
