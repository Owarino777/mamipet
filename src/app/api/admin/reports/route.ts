import { requireAdminAccount } from "@/modules/administration/application/require-admin-account";
import {
  mapReportRow,
  reportSelect,
} from "@/modules/trust-moderation/presentation/report.mapper";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAdminAccount(request);
    const { data, error } = await supabase
      .from("signalement")
      .select(reportSelect)
      .order("date_signalement", { ascending: false });

    throwIfSupabaseError(error, "Unable to list reports.");

    return jsonOk((data ?? []).map((row) => mapReportRow(row)));
  } catch (error) {
    return jsonError(error);
  }
}
