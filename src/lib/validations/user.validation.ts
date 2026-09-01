import { z } from "zod";

export const updateProgressStatusSchema = z.object({
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "MASTERED"]),
});

export const solveProblemSchema = z.object({
  hintsUsed: z.number().int().min(0).optional(),
});
