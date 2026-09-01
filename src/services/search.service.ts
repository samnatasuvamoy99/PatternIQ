import { prisma } from "@/lib/prisma";

export async function globalSearch(q: string) {
  if (!q || q.trim().length === 0) {
    return { topics: [], patterns: [], problems: [], articles: [] };
  }

  const [topics, patterns, problems, articles] = await Promise.all([
    prisma.topic.findMany({
      where: { published: true, name: { contains: q, mode: "insensitive" } },
      take: 5,
    }),
    prisma.pattern.findMany({
      where: { status: "PUBLISHED", name: { contains: q, mode: "insensitive" } },
      take: 5, select: { id: true, name: true, slug: true, difficulty: true },
    }),
    prisma.problem.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      take: 5, select: { id: true, title: true, difficulty: true, solveUrl: true },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED", title: { contains: q, mode: "insensitive" } },
      take: 5, select: { id: true, title: true, slug: true, category: true },
    }),
  ]);

  return { topics, patterns, problems, articles };
}
