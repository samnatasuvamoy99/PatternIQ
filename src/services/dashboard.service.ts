import { prisma } from "@/lib/prisma";

export async function getStudentDashboard(userId: string) {
  const [
    totalPatterns, patternProgress, totalProblems, problemProgress,
    articlesPublished, revisionDue, recentArticles, recentActivity,
  ] = await Promise.all([
    prisma.pattern.count({ where: { status: "PUBLISHED" } }),
    prisma.userPatternProgress.findMany({
      where: { userId }, include: { pattern: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.problem.count(),
    prisma.userProblemProgress.findMany({ where: { userId, status: "SOLVED" } }),
    prisma.article.count({ where: { authorId: userId, status: "PUBLISHED" } }),
    prisma.revision.findMany({
      where: { userId, status: "PENDING", scheduledAt: { lte: new Date() } },
      include: { pattern: { select: { id: true, name: true, slug: true } } },
      take: 5, orderBy: { scheduledAt: "asc" },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take: 5,
      select: { id: true, title: true, slug: true, category: true, publishedAt: true },
    }),
    prisma.userProblemProgress.findMany({
      where: { userId }, orderBy: { updatedAt: "desc" }, take: 5,
      include: { problem: { select: { id: true, title: true, slug: true } } },
    }),
  ]);

  const completedPatterns = patternProgress.filter(
    (p) => p.status === "COMPLETED" || p.status === "MASTERED"
  ).length;
  const masteredPatterns = patternProgress.filter((p) => p.status === "MASTERED").length;

  const continueLearning = patternProgress
    .filter((p) => p.status === "IN_PROGRESS")
    .slice(0, 5);

  const overallProgress = totalPatterns > 0
    ? Math.round((completedPatterns / totalPatterns) * 100)
    : 0;

  return {
    stats: {
      totalPatterns,
      completedPatterns,
      masteredPatterns,
      totalProblems,
      solvedProblems: problemProgress.length,
      articlesPublished,
    },
    overallProgress,
    continueLearning,
    revisionDue,
    recentArticles,
    recentActivity,
  };
}

export async function getAdminDashboard() {
  const [
    totalUsers, totalPatterns, totalProblems, publishedArticles,
    pendingArticles, totalComments, recentSubmissions, popularPatterns,
    popularArticles, mostActiveUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.pattern.count(),
    prisma.problem.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "SUBMITTED" } }),
    prisma.articleComment.count({ where: { status: { not: "DELETED" } } }),
    prisma.article.findMany({
      where: { status: "SUBMITTED" }, take: 5, orderBy: { updatedAt: "desc" },
      include: { author: { select: { name: true } } },
    }),
    prisma.pattern.findMany({
      take: 5, orderBy: { progress: { _count: "desc" } },
      select: { id: true, name: true, slug: true, _count: { select: { progress: true } } },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" }, take: 5, orderBy: { likes: { _count: "desc" } },
      select: { id: true, title: true, slug: true, _count: { select: { likes: true } } },
    }),
    prisma.user.findMany({
      take: 5, orderBy: { articles: { _count: "desc" } },
      select: { id: true, name: true, _count: { select: { articles: true, comments: true } } },
    }),
  ]);

  return {
    totals: {
      users: totalUsers, patterns: totalPatterns, problems: totalProblems,
      publishedArticles, pendingArticles, comments: totalComments,
    },
    recentSubmissions,
    popularPatterns,
    popularArticles,
    mostActiveUsers,
  };
}
