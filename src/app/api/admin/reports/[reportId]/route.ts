import { requireAdminAccount } from "@/modules/administration/application/require-admin-account";
import {
  mapReportRow,
  reportSelect,
} from "@/modules/trust-moderation/presentation/report.mapper";
import { updateReportStatusSchema } from "@/modules/trust-moderation/presentation/report.schemas";
import { NotFoundError } from "@/shared/errors/http-error";
import { parseJsonBody } from "@/shared/http/request-json";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

type AdminReportRouteContext = {
  params: Promise<{
    reportId: string;
  }>;
};

export async function PATCH(request: Request, context: AdminReportRouteContext) {
  try {
    const { reportId } = await context.params;
    const { supabase } = await requireAdminAccount(request);
    const input = await parseJsonBody(request, updateReportStatusSchema);
    const resolvedStatuses = new Set(["processed", "rejected", "closed"]);
    const { data, error } = await supabase
      .from("signalement")
      .update({
        statut_ticket: input.status,
        commentaire_resolution: input.resolutionComment ?? null,
        date_resolution: resolvedStatuses.has(input.status)
          ? new Date().toISOString()
          : null,
      })
      .eq("id_signalement", reportId)
      .select(reportSelect)
      .maybeSingle();

    throwIfSupabaseError(error, "Unable to update report.");

    if (!data) {
      throw new NotFoundError("Report not found.");
    }

    return jsonOk(mapReportRow(data));
  } catch (error) {
    return jsonError(error);
  }
}
