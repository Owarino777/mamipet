import { ok } from "@/shared/http/api-response";

export function GET() {
  return Response.json(
    ok({
      service: "mamipet",
      status: "ok",
    }),
  );
}
