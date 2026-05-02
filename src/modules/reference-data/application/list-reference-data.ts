import {
  mapReferenceRow,
  type ReferenceItemDto,
} from "@/modules/reference-data/presentation/reference-data.mapper";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { createSupabaseRouteClient } from "@/shared/supabase/route-client";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

type ReferenceDataConfig = {
  table: string;
  idKey: string;
  codeKey: string;
  labelKey: string;
};

export async function listReferenceData(
  request: Request,
  config: ReferenceDataConfig,
): Promise<Response> {
  try {
    const supabase = createSupabaseRouteClient(request);
    const { data, error } = await supabase
      .from(config.table)
      .select()
      .order(config.labelKey, { ascending: true });

    throwIfSupabaseError(error, "Unable to read reference data.");

    const items: ReferenceItemDto[] = (data ?? []).map((row) =>
      mapReferenceRow(
        row as unknown as Record<string, unknown>,
        config.idKey,
        config.codeKey,
        config.labelKey,
      ),
    );

    return jsonOk(items);
  } catch (error) {
    return jsonError(error);
  }
}
