import {
  mapReportRow,
  reportSelect,
} from "@/modules/trust-moderation/presentation/report.mapper";
import { requireAuthenticatedUser } from "@/shared/auth/current-user";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireAuthenticatedUser(request);
    const { data, error } = await supabase
      .from("signalement")
      .select(reportSelect)
      .eq("id_compte_createur", user.id)
      .order("date_signalement", { ascending: false });

    throwIfSupabaseError(error, "Unable to list reports.");

    return jsonOk((data ?? []).map((row) => mapReportRow(row)));
  } catch (error) {
    return jsonError(error);
  }
}
