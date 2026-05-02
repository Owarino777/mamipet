import { requirePetSitterProfile } from "@/modules/pet-sitters/application/require-pet-sitter-profile";
import {
  mapPetSitterProfileRow,
  petSitterProfileSelect,
} from "@/modules/pet-sitters/presentation/pet-sitter-profile.mapper";
import { updatePetSitterOfferSchema } from "@/modules/pet-sitters/presentation/pet-sitter-profile.schemas";
import { requireAuthenticatedUser } from "@/shared/auth/current-user";
import { NotFoundError } from "@/shared/errors/http-error";
import { parseJsonBody } from "@/shared/http/request-json";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

const offerTables = {
  species: {
    table: "profil_pet_sitter_espece",
    column: "id_espece",
  },
  careCapabilities: {
    table: "profil_pet_sitter_capacite_soin",
    column: "id_capacite_soin",
  },
  careLocations: {
    table: "profil_pet_sitter_lieu_garde",
    column: "id_lieu_garde",
  },
  careFormats: {
    table: "profil_pet_sitter_format_garde",
    column: "id_format_garde",
  },
  additionalServices: {
    table: "profil_pet_sitter_service_additionnel",
    column: "id_service_additionnel",
  },
} as const;

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireAuthenticatedUser(request);
    const petSitterProfile = await requirePetSitterProfile(supabase, user.id);
    const profile = await readPetSitterProfile(supabase, petSitterProfile.id);

    return jsonOk(mapPetSitterProfileRow(profile).offer);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const { supabase, user } = await requireAuthenticatedUser(request);
    const petSitterProfile = await requirePetSitterProfile(supabase, user.id);
    const input = await parseJsonBody(request, updatePetSitterOfferSchema);

    await replaceOfferRows(
      supabase,
      petSitterProfile.id,
      offerTables.species.table,
      offerTables.species.column,
      input.speciesIds,
    );
    await replaceOfferRows(
      supabase,
      petSitterProfile.id,
      offerTables.careCapabilities.table,
      offerTables.careCapabilities.column,
      input.careCapabilityIds,
    );
    await replaceOfferRows(
      supabase,
      petSitterProfile.id,
      offerTables.careLocations.table,
      offerTables.careLocations.column,
      input.careLocationIds,
    );
    await replaceOfferRows(
      supabase,
      petSitterProfile.id,
      offerTables.careFormats.table,
      offerTables.careFormats.column,
      input.careFormatIds,
    );
    await replaceOfferRows(
      supabase,
      petSitterProfile.id,
      offerTables.additionalServices.table,
      offerTables.additionalServices.column,
      input.additionalServiceIds,
    );

    const profile = await readPetSitterProfile(supabase, petSitterProfile.id);

    return jsonOk(mapPetSitterProfileRow(profile).offer);
  } catch (error) {
    return jsonError(error);
  }
}

async function replaceOfferRows(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedUser>>["supabase"],
  petSitterProfileId: string,
  table: string,
  relationColumn: string,
  relationIds: string[],
) {
  const { error: deleteError } = await supabase
    .from(table)
    .delete()
    .eq("id_profil_pet_sitter", petSitterProfileId);

  throwIfSupabaseError(deleteError, "Unable to replace pet-sitter offer.");

  if (relationIds.length === 0) {
    return;
  }

  const rows = relationIds.map((id) => ({
    id_profil_pet_sitter: petSitterProfileId,
    [relationColumn]: id,
  }));

  const { error: insertError } = await supabase.from(table).insert(rows);

  throwIfSupabaseError(insertError, "Unable to replace pet-sitter offer.");
}

async function readPetSitterProfile(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedUser>>["supabase"],
  petSitterProfileId: string,
) {
  const { data, error } = await supabase
    .from("profil_pet_sitter")
    .select(petSitterProfileSelect)
    .eq("id_profil_pet_sitter", petSitterProfileId)
    .maybeSingle();

  throwIfSupabaseError(error, "Unable to read pet-sitter profile.");

  if (!data) {
    throw new NotFoundError("Pet-sitter profile not found.");
  }

  return data;
}
