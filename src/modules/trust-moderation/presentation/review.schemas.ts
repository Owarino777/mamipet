import { z } from "zod";

const reviewNote = z.number().int().min(1).max(5);

export const createReviewSchema = z.object({
  rating: reviewNote,
  comment: z.string().trim().max(2000).nullable().optional(),
  punctualityRating: reviewNote.nullable().optional(),
  communicationRating: reviewNote.nullable().optional(),
  careRating: reviewNote.nullable().optional(),
  trustRating: reviewNote.nullable().optional(),
});

export const replyToReviewSchema = z.object({
  reply: z.string().trim().min(1).max(2000),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ReplyToReviewInput = z.infer<typeof replyToReviewSchema>;
