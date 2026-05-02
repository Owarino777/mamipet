import { z } from "zod";

export const verificationStatuses = [
  "draft",
  "published_unverified",
  "identity_verified",
  "professional_verified",
  "suspended",
  "rejected",
] as const;

export const updateVerificationStatusSchema = z.object({
  status: z.enum(verificationStatuses),
});

export const professionalDocumentDecisionSchema = z.object({
  adminComment: z.string().trim().max(2000).nullable().optional(),
});

export const assignBadgeSchema = z.object({
  badgeId: z.string().uuid(),
  origin: z.string().trim().min(1).max(120).default("admin"),
});

export type UpdateVerificationStatusInput = z.infer<
  typeof updateVerificationStatusSchema
>;
export type ProfessionalDocumentDecisionInput = z.infer<
  typeof professionalDocumentDecisionSchema
>;
export type AssignBadgeInput = z.infer<typeof assignBadgeSchema>;
