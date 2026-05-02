import { z } from "zod";

export const reportCategories = [
  "reservation",
  "profile",
  "review",
  "incident",
  "other",
] as const;

export const reportStatuses = [
  "open",
  "in_progress",
  "processed",
  "rejected",
  "closed",
] as const;

export const createReportSchema = z.object({
  category: z.enum(reportCategories),
  reason: z.string().trim().min(1).max(4000),
  reservationId: z.string().uuid().nullable().optional(),
  petSitterProfileId: z.string().uuid().nullable().optional(),
  reviewId: z.string().uuid().nullable().optional(),
});

export const updateReportStatusSchema = z.object({
  status: z.enum(reportStatuses),
  resolutionComment: z.string().trim().max(4000).nullable().optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;
