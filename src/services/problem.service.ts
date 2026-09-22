import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import { uniqueProblemSlug } from "@/lib/slug";

export async function listPublicProblems(params: {
  difficulty?: string; page: number; limit: number; skip: number;
}) {
  const where: Record<string, unknown> = {};
  if (params.difficulty) where.difficulty = params.difficulty;

  const [items, total] = await Promise.all([
    prisma.problem.findMany({ where, skip: params.skip, take: params.limit, orderBy: { createdAt: "desc" } }),
    prisma.problem.count({ where }),
  ]);
  return { items, total };
}

export async function getProblemById(id: string) {
  const problem = await prisma.problem.findUnique({
    where: { id },
    include: { patterns: { include: { pattern: { select: { id: true, name: true, slug: true } } } } },
  });
  if (!problem) throw ApiError.notFound("Problem not found");
  return problem;
}

// ---- Admin ----

interface ProblemInput {
  title: string;
  platform?: string | null;
  externalId?: string | null;
  solveUrl: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  patternId?: string | null;
  isCore?: boolean;
}

export async function adminListProblems() {
  return prisma.problem.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      patterns: {
        include: {
          pattern: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });
}

export async function adminGetProblem(id: string) {
  const problem = await prisma.problem.findUnique({
    where: { id },
    include: {
      patterns: {
        include: {
          pattern: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });
  if (!problem) throw ApiError.notFound("Problem not found");
  return problem;
}

export async function adminCreateProblem(input: ProblemInput) {
  const { patternId, isCore, ...rest } = input;
  const slug = await uniqueProblemSlug(input.title);
  const problem = await prisma.problem.create({ data: { ...rest, slug } });

  if (patternId && patternId.trim() !== "") {
    const pattern = await prisma.pattern.findUnique({ where: { id: patternId } });
    if (pattern) {
      await prisma.patternProblem.create({
        data: {
          patternId,
          problemId: problem.id,
          isCore: isCore ?? true,
          order: 0,
        },
      }).catch(() => {});
    }
  }

  return prisma.problem.findUnique({
    where: { id: problem.id },
    include: {
      patterns: {
        include: {
          pattern: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });
}

export async function adminUpdateProblem(id: string, input: Partial<ProblemInput>) {
  await adminGetProblem(id);
  const { patternId, isCore, ...rest } = input;
  const data: Record<string, unknown> = { ...rest };
  if (input.title) data.slug = await uniqueProblemSlug(input.title);

  if (patternId !== undefined) {
    // Remove existing pattern associations for this problem
    await prisma.patternProblem.deleteMany({
      where: { problemId: id },
    });

    // If a valid pattern ID is provided, establish new association
    if (patternId && patternId.trim() !== "") {
      const pattern = await prisma.pattern.findUnique({ where: { id: patternId } });
      if (pattern) {
        await prisma.patternProblem.create({
          data: {
            patternId,
            problemId: id,
            isCore: isCore ?? true,
            order: 0,
          },
        });
      }
    }
  }

  return prisma.problem.update({
    where: { id },
    data,
    include: {
      patterns: {
        include: {
          pattern: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });
}

export async function adminDeleteProblem(id: string) {
  await adminGetProblem(id);
  await prisma.problem.delete({ where: { id } });
  return { message: "Problem deleted" };
}
