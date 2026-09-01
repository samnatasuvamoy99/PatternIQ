import slugify from "slugify";
import { prisma } from "./prisma";

export function toSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, trim: true });
}

/**
 * Generates a unique slug for a given Prisma model by appending
 * -2, -3, etc. if the base slug is already taken.
 */
export async function generateUniqueSlug(
  base: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  const baseSlug = toSlug(base);
  let slug = baseSlug;
  let counter = 2;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
  return slug;
}

export async function uniqueArticleSlug(title: string) {
  return generateUniqueSlug(title, async (slug) => {
    const existing = await prisma.article.findUnique({ where: { slug } });
    return !!existing;
  });
}

export async function uniquePatternSlug(name: string) {
  return generateUniqueSlug(name, async (slug) => {
    const existing = await prisma.pattern.findUnique({ where: { slug } });
    return !!existing;
  });
}

export async function uniqueTopicSlug(name: string) {
  return generateUniqueSlug(name, async (slug) => {
    const existing = await prisma.topic.findUnique({ where: { slug } });
    return !!existing;
  });
}

export async function uniqueProblemSlug(title: string) {
  return generateUniqueSlug(title, async (slug) => {
    const existing = await prisma.problem.findUnique({ where: { slug } });
    return !!existing;
  });
}
