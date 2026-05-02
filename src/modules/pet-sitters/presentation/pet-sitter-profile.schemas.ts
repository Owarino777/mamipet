import { z } from "zod";

const uniqueUuidArray = z
  .array(z.string().uuid())
  .max(50)
  .transform((ids) => Array.from(new Set(ids)));

export const createPetSitterProfileSchema = z.object({
  pseudo: z.string().trim().min(1).max(80).nullable().optional(),
  firstName: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1).max(40).nullable().optional(),
  photoUrl: z.string().url().nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  addressLine1: z.string().trim().min(1).max(180).nullable().optional(),
  addressLine2: z.string().trim().min(1).max(180).nullable().optional(),
  postalCode: z.string().trim().min(1).max(20).nullable().optional(),
  city: z.string().trim().min(1).max(120),
  country: z.string().trim().min(1).max(120).default("France"),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  basePriceCents: z.number().int().min(0),
  interventionRadiusKm: z.number().int().min(0).max(300),
  publicVisibility: z.boolean().default(false),
});

export const updatePetSitterProfileSchema = createPetSitterProfileSchema.partial();

export const updatePetSitterOfferSchema = z.object({
  speciesIds: uniqueUuidArray.default([]),
  careCapabilityIds: uniqueUuidArray.default([]),
  careLocationIds: uniqueUuidArray.default([]),
  careFormatIds: uniqueUuidArray.default([]),
  additionalServiceIds: uniqueUuidArray.default([]),
});

export const searchPetSittersSchema = z.object({
  city: z.string().trim().min(1).max(120).optional(),
  speciesId: z.string().uuid().optional(),
  careCapabilityId: z.string().uuid().optional(),
  careLocationId: z.string().uuid().optional(),
  careFormatId: z.string().uuid().optional(),
  maxBasePriceCents: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreatePetSitterProfileInput = z.infer<
  typeof createPetSitterProfileSchema
>;
export type UpdatePetSitterProfileInput = z.infer<
  typeof updatePetSitterProfileSchema
>;
export type UpdatePetSitterOfferInput = z.infer<typeof updatePetSitterOfferSchema>;
export type SearchPetSittersInput = z.infer<typeof searchPetSittersSchema>;
