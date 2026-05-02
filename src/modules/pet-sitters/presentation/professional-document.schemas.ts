import { z } from "zod";

export const createProfessionalDocumentSchema = z.object({
  type: z.string().trim().min(1).max(120),
  fileName: z.string().trim().min(1).max(255).nullable().optional(),
  filePath: z.string().trim().min(1).max(1000).nullable().optional(),
});

export type CreateProfessionalDocumentInput = z.infer<
  typeof createProfessionalDocumentSchema
>;
