import { z } from "zod";

export const createPatternSchema = z.object({
  topicId: z.string().min(1, "topicId is required"),
  number: z.number().int(),
  name: z.string().min(2).max(150),
  shortDescription: z.string().max(300).optional(),
  whatIsThis: z.string().optional(),
  intuition: z.string().optional(),
  identificationSignals: z.string().optional(),
  executionRecipe: z.string().optional(),
  coreIdea: z.string().optional(),
  interviewRule: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  importance: z.number().int().min(1).max(5).optional(),
  timeComplexity: z.string().max(50).optional(),
  spaceComplexity: z.string().max(50).optional(),
  pseudocode: z.string().optional(),
  cppTemplate: z.string().optional(),
  javaTemplate: z.string().optional(),
  jsTemplate: z.string().optional(),
  pyTemplate: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  benchmarkProblemIds: z.array(z.string()).optional(),
  useCases: z.array(z.string()).optional(),
  whenNotToUse: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
});

export const updatePatternSchema = createPatternSchema.partial();
