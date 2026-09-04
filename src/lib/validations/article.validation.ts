import { z } from "zod";

export const articleCategoryEnum = z.enum([
  "DSA",
  "DEVELOPMENT",
  "CORE_CS",
  "SYSTEM_DESIGN",
  "DATABASE",
  "DEVOPS",
  "GENAI",
  "PROGRAMMING",
  "OTHER",
]);

export const createArticleSchema = z.object({
  title: z.string().min(5).max(200),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(50, "Content must be at least 50 characters"),
  coverImage: z.string().url().optional().or(z.literal("")),
  category: articleCategoryEnum,
  subtopic: z.string().min(2).max(100).optional(),
});

export const adminCreateArticleSchema = createArticleSchema.extend({
  status: z.enum(["DRAFT", "PUBLISHED"]).optional().default("PUBLISHED"),
});

export const updateArticleSchema = createArticleSchema.partial();

export const rejectArticleSchema = z.object({
  reason: z.string().min(5).max(1000).optional(),
});
