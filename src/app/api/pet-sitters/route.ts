import {
  mapPetSitterPublicProfileRow,
  publicPetSitterProfileSelect,
} from "@/modules/pet-sitters/presentation/pet-sitter-profile.mapper";
import { searchPetSittersSchema } from "@/modules/pet-sitters/presentation/pet-sitter-profile.schemas";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { createSupabaseRouteClient } from "@/shared/supabase/route-client";
import { throwIfSupabaseError } from "@/shared/supabase/errors";
import { validateInput } from "@/shared/http/validate-input";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const input = validateInput(searchPetSittersSchema,
      Object.fromEntries(url.searchParams.entries()),
    );
    const supabase = createSupabaseRouteClient(request);
    const from = (input.page - 1) * input.pageSize;
    const to = from + input.pageSize - 1;

    let query = supabase
      .from("pet_sitter_public_profile")
      .select(publicPetSitterProfileSelect, { count: "exact" })
      .order("date_creation", { ascending: false })
      .range(from, to);

    if (input.city) {
      query = query.ilike("ville", `%${input.city}%`);
    }

    if (input.maxBasePriceCents !== undefined) {
      query = query.lte("tarif_base", input.maxBasePriceCents / 100);
    }

    if (input.speciesId) query = query.contains("species_ids", [input.speciesId]);
    if (input.careCapabilityId) query = query.contains("care_capability_ids", [input.careCapabilityId]);
    if (input.careLocationId) query = query.contains("care_location_ids", [input.careLocationId]);
    if (input.careFormatId) query = query.contains("care_format_ids", [input.careFormatId]);

    const { data, error, count } = await query;

    throwIfSupabaseError(error, "Unable to search pet-sitters.");

    return jsonOk(
      (data ?? []).map((row) => mapPetSitterPublicProfileRow(row)),
      {},
      {
        page: input.page,
        pageSize: input.pageSize,
        total: count ?? (data ?? []).length,
      },
    );
  } catch (error) {
    return jsonError(error);
  }
}
