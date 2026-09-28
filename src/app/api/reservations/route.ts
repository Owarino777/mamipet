import { randomUUID } from "node:crypto";
import { calculatePaymentBreakdown } from "@/modules/payments/domain/platform-commission";
import { requireOwnerProfile } from "@/modules/owners/application/require-owner-profile";
import { Reservation } from "@/modules/reservations/domain/reservation.entity";
import {
  mapReservationRow,
  reservationSelect,
} from "@/modules/reservations/presentation/reservation.mapper";
import { createReservationSchema } from "@/modules/reservations/presentation/reservation.schemas";
import { requireAuthenticatedUser } from "@/shared/auth/current-user";
import { HttpError } from "@/shared/errors/http-error";
import { parseJsonBody } from "@/shared/http/request-json";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAuthenticatedUser(request);
    const { data, error } = await supabase
      .from("reservation")
      .select(reservationSelect)
      .order("date_demande", { ascending: false });

    throwIfSupabaseError(error, "Unable to list reservations.");

    return jsonOk((data ?? []).map((row) => mapReservationRow(row)));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAuthenticatedUser(request);
    const ownerProfile = await requireOwnerProfile(supabase, user.id);
    const input = await parseJsonBody(request, createReservationSchema);

    const { data: animals, error: animalsError } = await supabase
      .from("animal")
      .select("id_animal,id_profil_proprietaire")
      .eq("id_profil_proprietaire", ownerProfile.id)
      .in("id_animal", input.animalIds);

    throwIfSupabaseError(animalsError, "Unable to verify reservation animals.");

    if ((animals ?? []).length !== input.animalIds.length) {
      throw new HttpError(
        "All selected animals must belong to the current owner.",
        422,
        "INVALID_RESERVATION_ANIMALS",
      );
    }

    const basePriceCents = Math.floor(input.agreedPriceCents / input.animalIds.length);
    const remainderCents = input.agreedPriceCents % input.animalIds.length;
    const reservation = Reservation.create({
      id: randomUUID(),
      ownerProfileId: ownerProfile.id,
      petSitterProfileId: input.petSitterProfileId,
      careLocationId: input.careLocationId,
      careFormatId: input.careFormatId,
      startDate: new Date(input.startAt),
      endDate: new Date(input.endAt),
      insuranceLevel: input.insuranceLevel,
      agreedPriceCents: input.agreedPriceCents,
      animals: input.animalIds.map((animalId, index) => ({
        animalId,
        ownerProfileId: ownerProfile.id,
        priceCents: basePriceCents + (index < remainderCents ? 1 : 0),
      })),
      instructions: input.instructions ?? null,
    });

    const { error: reservationError } = await supabase.rpc("create_reservation_with_animals", {
      p_id_reservation: reservation.id,
      p_id_profil_proprietaire: reservation.ownerProfileId,
      p_id_profil_pet_sitter: reservation.petSitterProfileId,
      p_id_lieu_garde: reservation.careLocationId,
      p_id_format_garde: reservation.careFormatId,
      p_date_debut: reservation.startDate.toISOString(),
      p_date_fin: reservation.endDate.toISOString(),
      p_niveau_assurance: reservation.insuranceLevel,
      p_tarif_centimes: reservation.agreedPriceCents,
      p_consignes: reservation.instructions,
      p_animaux: input.animalIds,
    });
    throwIfSupabaseError(reservationError, "Unable to create reservation.");

    const created = await readReservation(supabase, reservation.id);
    const paymentPreview = calculatePaymentBreakdown(input.agreedPriceCents);

    return jsonOk(
      mapReservationRow(created),
      { status: 201 },
      {
        paymentPreview,
      },
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function readReservation(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedUser>>["supabase"],
  reservationId: string,
) {
  const { data, error } = await supabase
    .from("reservation")
    .select(reservationSelect)
    .eq("id_reservation", reservationId)
    .maybeSingle();

  throwIfSupabaseError(error, "Unable to read reservation.");

  if (!data) {
    throw new HttpError("Reservation not found.", 404, "NOT_FOUND");
  }

  return data;
}
