import { z } from "zod";

const manualAvailabilityStatuses = ["available", "unavailable"] as const;
const isoDateTime = z.string().datetime({ offset: true });

export const createAvailabilitySchema = z.object({
  startAt: isoDateTime,
  endAt: isoDateTime,
  status: z.enum(manualAvailabilityStatuses).default("available"),
  comment: z.string().trim().max(1000).nullable().optional(),
});

export const updateAvailabilitySchema = createAvailabilitySchema.partial();

export type CreateAvailabilityInput = z.infer<typeof createAvailabilitySchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
