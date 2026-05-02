import { z } from "zod";

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

export type CreatePetSitterProfileInput = z.infer<
  typeof createPetSitterProfileSchema
>;
export type UpdatePetSitterProfileInput = z.infer<
  typeof updatePetSitterProfileSchema
>;
