import { ConflictError } from "@/shared/errors/http-error";
import { jsonError } from "@/shared/http/route-response";

// Open only after Connect onboarding and signed, idempotent payment webhooks are live.
export async function POST(): Promise<Response> {
  return jsonError(new ConflictError("Online payment is not available yet."));
}
