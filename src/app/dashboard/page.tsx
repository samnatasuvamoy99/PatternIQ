"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { AuthGuard } from "@/components/auth/auth-guard";
import { apiClient } from "@/lib/api-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Flame,
  CheckCircle2,
  Layers,
  Repeat,
  ArrowRight,
  Clock,
  Sparkles,
  BookOpen,
  Loader2,
  Check,
} from "lucide-react";

interface DashboardData {
  streak: {
    current: number;
    best: number;
  };
  problems: {
    total: number;
    solved: number;
    percentage: number;
  };
  patterns: {
    total: number;
    completed: number;
    mastered: number;
    inProgress: number;
    percentage: number;
  };
  difficulty: {
    easy: { solved: number; total: number; percentage: number };
    medium: { solved: number; total: number; percentage: number };
    hard: { solved: number; total: number; percentage: number };
  };
  tracks: Array<{
    id: string;
    name: string;
    slug: string;
    patternCount: number;
    completedCount: number;
    percentage: number;
  }>;
  revisions: Array<{
    id: string;
    patternId: string;
    patternName: string;
    patternSlug: string;
    difficulty: string;
    scheduledAt: string;
    intervalDays: number;
    repetitionCount: number;
  }>;
  revisionsDueCount: number;
  articlesPublished: number;
  recentActivity?: Array<{
    id: string;
    status: string;
    updatedAt: string;
    problem: { id: string; title: string; slug: string };
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return;
      setIsLoading(true);
      try {
        const res = await apiClient<DashboardData>("/dashboard");
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  return (
    <AuthGuard>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Top Welcome Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, <span className="text-primary">{user?.name || "Student"}</span> 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {data && data.problems.solved > 0
                ? `You've solved ${data.problems.solved} problems across ${data.patterns.completed} patterns. Keep the momentum going!`
                : "Begin your DSA journey by exploring foundational patterns and tracking your progress."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/revision">
              <Button className="gap-2 shadow-sm">
                <Repeat className="h-4 w-4" />
                <span>Review Today ({data?.revisionsDueCount ?? 0})</span>
              </Button>
            </Link>
            <Link href="/patterns">
              <Button variant="outline" className="gap-2">
                <Layers className="h-4 w-4" />
                <span>Explore Patterns</span>
              </Button>
            </Link>
          </div>
        </div>

        {isLoading && !data ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Loading your personalized dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* METRIC CARDS ROW */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Streak */}
              <Card className="p-5 border-amber-500/20 bg-gradient-to-br from-card to-amber-500/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Learning Streak
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500">
                    <Flame className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-2 text-3xl font-extrabold text-foreground">
                  {data?.streak.current ?? 0} {data?.streak.current === 1 ? "Day" : "Days"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Personal best: {data?.streak.best ?? 0} {data?.streak.best === 1 ? "day" : "days"}
                </p>
              </Card>

              {/* Problems Solved */}
              <Card className="p-5 border-emerald-500/20 bg-gradient-to-br from-card to-emerald-500/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Problems Solved
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-2 text-3xl font-extrabold text-foreground">
                  {data?.problems.solved ?? 0}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    / {data?.problems.total ?? 0}
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {data?.problems.percentage ?? 0}% syllabus coverage
                </p>
              </Card>

              {/* Patterns Mastered */}
              <Card className="p-5 border-primary/20 bg-gradient-to-br from-card to-primary/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Patterns Mastered
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Layers className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-2 text-3xl font-extrabold text-foreground">
                  {data?.patterns.mastered ?? 0}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    / {data?.patterns.total ?? 0}
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {data?.patterns.percentage ?? 0}% mastery rate
                </p>
              </Card>

              {/* Revisions Due Today */}
              <Card className="p-5 border-blue-500/20 bg-gradient-to-br from-card to-blue-500/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Revisions Due
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-500">
                    <Repeat className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-2 text-3xl font-extrabold text-foreground">
                  {data?.revisionsDueCount ?? 0}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Spaced repetition queue</p>
              </Card>
            </div>

            {/* MIDDLE SECTION: PROBLEM DIFFICULTY BREAKDOWN & DUE REVISIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Difficulty & Track Progress */}
              <div className="lg:col-span-2 space-y-6">
                {/* Difficulty breakdown */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Problem Solving Distribution</CardTitle>
                    <CardDescription>Breakdown by question difficulty level</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Easy */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-emerald-500 font-semibold">
                          Easy ({data?.difficulty.easy.solved ?? 0} / {data?.difficulty.easy.total ?? 0})
                        </span>
                        <span className="text-muted-foreground">
                          {data?.difficulty.easy.percentage ?? 0}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${data?.difficulty.easy.percentage ?? 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Medium */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-amber-500 font-semibold">
                          Medium ({data?.difficulty.medium.solved ?? 0} / {data?.difficulty.medium.total ?? 0})
                        </span>
                        <span className="text-muted-foreground">
                          {data?.difficulty.medium.percentage ?? 0}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${data?.difficulty.medium.percentage ?? 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Hard */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-rose-500 font-semibold">
                          Hard ({data?.difficulty.hard.solved ?? 0} / {data?.difficulty.hard.total ?? 0})
                        </span>
                        <span className="text-muted-foreground">
                          {data?.difficulty.hard.percentage ?? 0}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${data?.difficulty.hard.percentage ?? 0}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Learning Tracks */}
                <Card>
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Track Progress</CardTitle>
                      <CardDescription>Topic mastery based on completed patterns</CardDescription>
                    </div>
                    <Link href="/patterns">
                      <Button variant="ghost" size="sm" className="gap-1 text-xs">
                        <span>Browse by Topic</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent className="divide-y divide-border/60">
                    {data?.tracks && data.tracks.length > 0 ? (
                      data.tracks.slice(0, 4).map((topic) => (
                        <div key={topic.id} className="py-3 flex items-center justify-between gap-4">
                          <div className="space-y-1 min-w-0">
                            <p className="text-sm font-semibold truncate text-foreground">{topic.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {topic.completedCount} of {topic.patternCount} patterns completed
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="w-24 hidden sm:block">
                              <Progress value={topic.percentage} />
                            </div>
                            <span className="text-xs font-mono text-muted-foreground font-semibold">
                              {topic.percentage}%
                            </span>
                            <Link href={`/patterns?topic=${topic.slug}`}>
                              <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs">
                                Continue
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-xs text-muted-foreground">
                        No topic tracks active yet. Explore patterns to get started!
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right 1 Col: Today's Due Revisions & Quick Actions */}
              <div className="space-y-6">
                <Card className="border-primary/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span>Scheduled for Today</span>
                      </CardTitle>
                      <Badge variant="secondary">{data?.revisionsDueCount ?? 0} Due</Badge>
                    </div>
                    <CardDescription>Keep the algorithms fresh in your memory</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {data?.revisions && data.revisions.length > 0 ? (
                      data.revisions.map((rev) => (
                        <div
                          key={rev.id}
                          className="rounded-lg border border-border/80 bg-muted/30 p-3 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-semibold text-foreground line-clamp-1">
                              {rev.patternName}
                            </h4>
                            <Badge variant={rev.difficulty === "EASY" ? "easy" : "medium"}>
                              {rev.difficulty}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Interval: {rev.intervalDays}d
                            </span>
                            <span>Rep #{rev.repetitionCount}</span>
                          </div>
                          <Link href={`/revision`}>
                            <Button size="sm" className="w-full h-7 text-xs mt-1">
                              Review Pattern
                            </Button>
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center space-y-2">
                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                          <Check className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-semibold text-foreground">All caught up!</p>
                        <p className="text-[11px] text-muted-foreground">
                          No patterns currently due for revision. Great job staying on track!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick links card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Quick Shortcuts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href="/patterns" className="block">
                      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted text-xs transition-colors">
                        <span className="font-medium text-foreground">Browse DSA Patterns</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </Link>
                    <Link href="/problems" className="block">
                      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted text-xs transition-colors">
                        <span className="font-medium text-foreground">LeetCode Problem Catalog</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </Link>
                    <Link href="/articles" className="block">
                      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted text-xs transition-colors">
                        <span className="font-medium text-foreground">Community Study Notes</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
