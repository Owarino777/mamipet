import { z } from "zod";

export const createOwnerProfileSchema = z.object({
  pseudo: z.string().trim().min(1).max(80).nullable().optional(),
  firstName: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1).max(40).nullable().optional(),
  addressLine1: z.string().trim().min(1).max(180).nullable().optional(),
  addressLine2: z.string().trim().min(1).max(180).nullable().optional(),
  postalCode: z.string().trim().min(1).max(20).nullable().optional(),
  city: z.string().trim().min(1).max(120),
  country: z.string().trim().min(1).max(120).default("France"),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
});

export const updateOwnerProfileSchema = createOwnerProfileSchema.partial();

export type CreateOwnerProfileInput = z.infer<typeof createOwnerProfileSchema>;
export type UpdateOwnerProfileInput = z.infer<typeof updateOwnerProfileSchema>;
