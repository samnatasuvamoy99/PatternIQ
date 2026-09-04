import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/errors";

const REVISION_INTERVALS_DAYS = [1, 3, 7, 14, 30];

export async function getTodaysRevisions(userId: string) {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  return prisma.revision.findMany({
    where: { userId, status: "PENDING", scheduledAt: { lte: endOfToday } },
    include: {
      pattern: {
        select: {
          id: true,
          name: true,
          slug: true,
          difficulty: true,
          intuition: true,
          coreIdea: true,
          pseudocode: true,
          topic: { select: { id: true, name: true, slug: true } },
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function getUpcomingRevisions(userId: string) {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  return prisma.revision.findMany({
    where: { userId, status: "PENDING", scheduledAt: { gt: endOfToday } },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function getRevisionHistory(userId: string) {
  return prisma.revision.findMany({
    where: { userId, status: { in: ["COMPLETED", "SKIPPED"] } },
    orderBy: { completedAt: "desc" },
  });
}

async function getOwnedRevision(userId: string, id: string) {
  const revision = await prisma.revision.findUnique({ where: { id } });
  if (!revision || revision.userId !== userId) throw ApiError.notFound("Revision not found");
  return revision;
}

export async function startRevision(userId: string, id: string) {
  const revision = await getOwnedRevision(userId, id);
  if (revision.status !== "PENDING") {
    throw ApiError.conflict("This revision is no longer pending");
  }
  return revision; // marking "in progress" client-side; status only flips on complete/skip
}

function nextIntervalDays(currentIndex: number): number {
  const nextIndex = Math.min(currentIndex + 1, REVISION_INTERVALS_DAYS.length - 1);
  return REVISION_INTERVALS_DAYS[nextIndex];
}

export async function completeRevision(userId: string, id: string, score?: number) {
  const revision = await getOwnedRevision(userId, id);
  if (revision.status !== "PENDING") throw ApiError.conflict("Revision already resolved");

  return prisma.$transaction(async (tx) => {
    const completed = await tx.revision.update({
      where: { id },
      data: { status: "COMPLETED", completedAt: new Date(), score: score ?? null },
    });

    // Count how many completed revisions this pattern already has, to know which interval is next
    const priorCompletions = await tx.revision.count({
      where: { userId, patternId: revision.patternId, status: "COMPLETED" },
    });

    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + nextIntervalDays(priorCompletions - 1));

    await tx.revision.create({
      data: { userId, patternId: revision.patternId, scheduledAt, status: "PENDING" },
    });

    await tx.userPatternProgress.updateMany({
      where: { userId, patternId: revision.patternId },
      data: { lastRevisedAt: new Date(), nextRevisionAt: scheduledAt },
    });

    return completed;
  });
}

export async function skipRevision(userId: string, id: string) {
  const revision = await getOwnedRevision(userId, id);
  if (revision.status !== "PENDING") throw ApiError.conflict("Revision already resolved");

  return prisma.revision.update({
    where: { id },
    data: { status: "SKIPPED", completedAt: new Date() },
  });
}
