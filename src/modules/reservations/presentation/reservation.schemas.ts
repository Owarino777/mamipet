import { z } from "zod";
import { insuranceLevels } from "@/modules/reservations/domain/insurance-level";

const isoDateTime = z.string().datetime({ offset: true });

export const createReservationSchema = z.object({
  petSitterProfileId: z.string().uuid(),
  careLocationId: z.string().uuid(),
  careFormatId: z.string().uuid(),
  animalIds: z
    .array(z.string().uuid())
    .min(1)
    .max(10)
    .transform((ids) => Array.from(new Set(ids))),
  startAt: isoDateTime,
  endAt: isoDateTime,
  insuranceLevel: z.enum(insuranceLevels),
  agreedPriceCents: z.number().int().positive(),
  instructions: z.string().trim().max(4000).nullable().optional(),
});

export const refuseReservationSchema = z.object({
  reason: z.string().trim().min(1).max(1000),
});

export const cancelReservationSchema = z.object({
  reason: z.string().trim().min(1).max(1000),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type RefuseReservationInput = z.infer<typeof refuseReservationSchema>;
export type CancelReservationInput = z.infer<typeof cancelReservationSchema>;
