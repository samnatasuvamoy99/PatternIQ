import { z } from "zod";

export const createProblemSchema = z.object({
  title: z.string().min(2).max(200),
  platform: z.string().max(50).optional(),
  externalId: z.string().max(100).optional(),
  solveUrl: z.string().url("solveUrl must be a valid URL"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
});

export const updateProblemSchema = createProblemSchema.partial();

export const attachProblemSchema = z.object({
  problemId: z.string().min(1),
  isCore: z.boolean().optional(),
  order: z.number().int().optional(),
});

export const reorderProblemsSchema = z.object({
  items: z
    .array(z.object({ problemId: z.string(), order: z.number().int() }))
    .min(1),
});
