import { z } from "zod";
import { articleDocumentSchema } from "@/modules/blog/domain/article";

export const articleIdSchema = z.string().uuid();
export const saveArticleSchema = z
  .object({
    version: z.number().int().positive(),
    document: articleDocumentSchema,
  })
  .strict();
export const publishArticleSchema = z
  .object({ version: z.number().int().positive(), publish: z.boolean() })
  .strict();
export const articlePageSchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(4000)
  .default(1);
