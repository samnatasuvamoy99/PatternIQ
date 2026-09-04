import { prisma } from "@/lib/prisma";

export async function getStudentDashboard(userId: string) {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [
    totalPatternsCount,
    patternProgress,
    totalProblemsCount,
    problemProgress,
    problemsByDiff,
    topicsData,
    articlesPublished,
    revisionsDue,
    recentActivity,
    allCompletedRevisions,
  ] = await Promise.all([
    prisma.pattern.count({ where: { status: "PUBLISHED" } }),
    prisma.userPatternProgress.findMany({
      where: { userId },
      include: {
        pattern: { select: { id: true, name: true, slug: true, topicId: true } },
      },
    }),
    prisma.problem.count(),
    prisma.userProblemProgress.findMany({
      where: { userId, status: "SOLVED" },
      include: {
        problem: { select: { id: true, title: true, slug: true, difficulty: true } },
      },
    }),
    prisma.problem.groupBy({
      by: ["difficulty"],
      _count: { id: true },
    }),
    prisma.topic.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      include: {
        patterns: {
          where: { status: "PUBLISHED" },
          select: { id: true, name: true, slug: true },
        },
      },
    }),
    prisma.article.count({ where: { authorId: userId, status: "PUBLISHED" } }),
    prisma.revision.findMany({
      where: { userId, status: "PENDING", scheduledAt: { lte: endOfToday } },
      include: {
        pattern: { select: { id: true, name: true, slug: true, difficulty: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 10,
    }),
    prisma.userProblemProgress.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { problem: { select: { id: true, title: true, slug: true } } },
    }),
    prisma.revision.findMany({
      where: { userId, status: "COMPLETED" },
      select: { completedAt: true },
    }),
  ]);

  // 1. Calculate Streak
  const activityDates = new Set<string>();
  problemProgress.forEach((p) => {
    if (p.solvedAt) activityDates.add(p.solvedAt.toISOString().split("T")[0]);
  });
  allCompletedRevisions.forEach((r) => {
    if (r.completedAt) activityDates.add(r.completedAt.toISOString().split("T")[0]);
  });

  let currentStreak = 0;
  let bestStreak = 0;

  if (activityDates.size > 0) {
    const sortedDates = Array.from(activityDates).sort();
    // Calculate best streak
    let tempStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      if (tempStreak > bestStreak) bestStreak = tempStreak;
    }
    if (bestStreak === 0 && sortedDates.length > 0) bestStreak = 1;

    // Calculate current streak from today or yesterday
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let checkDate = new Date();
    if (!activityDates.has(todayStr) && activityDates.has(yesterdayStr)) {
      checkDate = yesterday;
    }

    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (activityDates.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // 2. Problem Difficulty Breakdown
  const diffTotalMap: Record<string, number> = { EASY: 0, MEDIUM: 0, HARD: 0 };
  problemsByDiff.forEach((g) => {
    diffTotalMap[g.difficulty] = g._count.id;
  });

  const diffSolvedMap: Record<string, number> = { EASY: 0, MEDIUM: 0, HARD: 0 };
  problemProgress.forEach((p) => {
    const diff = p.problem.difficulty;
    if (diff in diffSolvedMap) {
      diffSolvedMap[diff]++;
    }
  });

  const easyTotal = diffTotalMap.EASY || 0;
  const mediumTotal = diffTotalMap.MEDIUM || 0;
  const hardTotal = diffTotalMap.HARD || 0;

  const easySolved = diffSolvedMap.EASY || 0;
  const mediumSolved = diffSolvedMap.MEDIUM || 0;
  const hardSolved = diffSolvedMap.HARD || 0;

  const difficultyBreakdown = {
    easy: {
      solved: easySolved,
      total: easyTotal,
      percentage: easyTotal > 0 ? Math.round((easySolved / easyTotal) * 100) : 0,
    },
    medium: {
      solved: mediumSolved,
      total: mediumTotal,
      percentage: mediumTotal > 0 ? Math.round((mediumSolved / mediumTotal) * 100) : 0,
    },
    hard: {
      solved: hardSolved,
      total: hardTotal,
      percentage: hardTotal > 0 ? Math.round((hardSolved / hardTotal) * 100) : 0,
    },
  };

  // 3. Pattern & Problem overall stats
  const completedPatterns = patternProgress.filter(
    (p) => p.status === "COMPLETED" || p.status === "MASTERED"
  ).length;
  const masteredPatterns = patternProgress.filter((p) => p.status === "MASTERED").length;
  const inProgressPatterns = patternProgress.filter((p) => p.status === "IN_PROGRESS").length;

  const totalProblems = totalProblemsCount;
  const solvedProblems = problemProgress.length;
  const problemCoveragePct = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;
  const patternMasteryPct = totalPatternsCount > 0 ? Math.round((masteredPatterns / totalPatternsCount) * 100) : 0;

  // 4. Topic Track Progress
  const userCompletedPatternIds = new Set(
    patternProgress
      .filter((p) => p.status === "COMPLETED" || p.status === "MASTERED")
      .map((p) => p.patternId)
  );

  const tracks = topicsData.map((topic) => {
    const totalTopicPatterns = topic.patterns.length;
    const completedTopicPatterns = topic.patterns.filter((p) =>
      userCompletedPatternIds.has(p.id)
    ).length;
    const percentage =
      totalTopicPatterns > 0
        ? Math.round((completedTopicPatterns / totalTopicPatterns) * 100)
        : 0;

    return {
      id: topic.id,
      name: topic.name,
      slug: topic.slug,
      patternCount: totalTopicPatterns,
      completedCount: completedTopicPatterns,
      percentage,
    };
  });

  // 5. Mapped Revisions
  const mappedRevisions = revisionsDue.map((rev) => {
    const intervalDays = Math.max(
      1,
      Math.round(
        (rev.scheduledAt.getTime() - rev.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
    return {
      id: rev.id,
      patternId: rev.patternId,
      patternName: rev.pattern?.name || "Pattern Review",
      patternSlug: rev.pattern?.slug || "patterns",
      difficulty: rev.pattern?.difficulty || "MEDIUM",
      scheduledAt: rev.scheduledAt,
      intervalDays,
      repetitionCount: rev.score || 1,
    };
  });

  return {
    streak: {
      current: currentStreak,
      best: bestStreak,
    },
    problems: {
      total: totalProblems,
      solved: solvedProblems,
      percentage: problemCoveragePct,
    },
    patterns: {
      total: totalPatternsCount,
      completed: completedPatterns,
      mastered: masteredPatterns,
      inProgress: inProgressPatterns,
      percentage: patternMasteryPct,
    },
    difficulty: difficultyBreakdown,
    tracks,
    revisions: mappedRevisions,
    revisionsDueCount: revisionsDue.length,
    articlesPublished,
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
