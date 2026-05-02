import { z } from "zod";

const nullableText = z.string().trim().min(1).max(1000).nullable().optional();

export const createAnimalSchema = z.object({
  speciesId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  sex: z.string().trim().min(1).max(40).nullable().optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  color: z.string().trim().min(1).max(80).nullable().optional(),
  weightKg: z.number().min(0).max(5000).nullable().optional(),
  temperament: nullableText,
  specificNeeds: nullableText,
});

export const updateAnimalSchema = createAnimalSchema.partial();

export const upsertMedicalRecordSchema = z.object({
  careProtocol: z.string().trim().max(4000).nullable().optional(),
  frequency: z.string().trim().max(1000).nullable().optional(),
  confidentialInstructions: z.string().trim().max(4000).nullable().optional(),
});

export type CreateAnimalInput = z.infer<typeof createAnimalSchema>;
export type UpdateAnimalInput = z.infer<typeof updateAnimalSchema>;
export type UpsertMedicalRecordInput = z.infer<typeof upsertMedicalRecordSchema>;
