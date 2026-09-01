import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000),
  parentId: z.string().optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export const moderationLogSchema = z.object({
  reason: z.string().max(500).optional(),
});
