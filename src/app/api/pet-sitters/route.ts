import {
  mapPetSitterPublicProfileRow,
  petSitterProfileSelect,
} from "@/modules/pet-sitters/presentation/pet-sitter-profile.mapper";
import { searchPetSittersSchema } from "@/modules/pet-sitters/presentation/pet-sitter-profile.schemas";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { createSupabaseRouteClient } from "@/shared/supabase/route-client";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const input = searchPetSittersSchema.parse(
      Object.fromEntries(url.searchParams.entries()),
    );
    const supabase = createSupabaseRouteClient(request);
    const from = (input.page - 1) * input.pageSize;
    const to = from + input.pageSize - 1;

    let query = supabase
      .from("profil_pet_sitter")
      .select(petSitterProfileSelect, { count: "exact" })
      .eq("visibilite_publique", true)
      .not("statut_verification", "in", "(suspended,rejected)")
      .order("date_creation", { ascending: false })
      .range(from, to);

    if (input.city) {
      query = query.ilike("ville", `%${input.city}%`);
    }

    if (input.maxBasePriceCents !== undefined) {
      query = query.lte("tarif_base", input.maxBasePriceCents / 100);
    }

    const { data, error, count } = await query;

    throwIfSupabaseError(error, "Unable to search pet-sitters.");

    const filteredProfiles = (data ?? []).filter((profile) =>
      matchesOfferFilters(profile, input),
    );

    return jsonOk(
      filteredProfiles.map((row) => mapPetSitterPublicProfileRow(row)),
      {},
      {
        page: input.page,
        pageSize: input.pageSize,
        total: count ?? filteredProfiles.length,
      },
    );
  } catch (error) {
    return jsonError(error);
  }
}

type SearchInput = ReturnType<typeof searchPetSittersSchema.parse>;

function matchesOfferFilters(
  profile: Record<string, unknown>,
  input: SearchInput,
): boolean {
  return (
    matchesNestedId(
      profile.profil_pet_sitter_espece,
      "espece",
      "id_espece",
      input.speciesId,
    ) &&
    matchesNestedId(
      profile.profil_pet_sitter_capacite_soin,
      "capacite_soin",
      "id_capacite_soin",
      input.careCapabilityId,
    ) &&
    matchesNestedId(
      profile.profil_pet_sitter_lieu_garde,
      "lieu_garde",
      "id_lieu_garde",
      input.careLocationId,
    ) &&
    matchesNestedId(
      profile.profil_pet_sitter_format_garde,
      "format_garde",
      "id_format_garde",
      input.careFormatId,
    )
  );
}

function matchesNestedId(
  relations: unknown,
  relationKey: string,
  idKey: string,
  expectedId: string | undefined,
): boolean {
  if (!expectedId) {
    return true;
  }

  if (!Array.isArray(relations)) {
    return false;
  }

  return relations.some((relation) => {
    if (!isRecord(relation)) {
      return false;
    }

    const nested = relation[relationKey];

    return isRecord(nested) && nested[idKey] === expectedId;
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
