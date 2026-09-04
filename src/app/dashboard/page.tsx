"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MOCK_TOPICS, MOCK_PATTERNS, MOCK_REVISIONS } from "@/lib/mock-data";
import {
  Flame,
  CheckCircle2,
  Layers,
  Repeat,
  ArrowRight,
  Clock,
  Sparkles,
  BookOpen,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  const totalProblems = 150;
  const solvedCount = 42;
  const easySolved = 20;
  const mediumSolved = 18;
  const hardSolved = 4;

  const totalPatterns = 14;
  const masteredPatterns = 6;

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
            You are on track with your interview preparation goals. Keep the momentum going!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/revision">
            <Button className="gap-2 shadow-sm">
              <Repeat className="h-4 w-4" />
              <span>Review Today ({MOCK_REVISIONS.length})</span>
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
          <p className="mt-2 text-3xl font-extrabold text-foreground">7 Days</p>
          <p className="mt-1 text-xs text-muted-foreground">Personal best: 14 days</p>
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
            {solvedCount} <span className="text-sm font-normal text-muted-foreground">/ {totalProblems}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">28% syllabus coverage</p>
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
            {masteredPatterns} <span className="text-sm font-normal text-muted-foreground">/ {totalPatterns}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">42% mastery rate</p>
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
          <p className="mt-2 text-3xl font-extrabold text-foreground">{MOCK_REVISIONS.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Spaced repetition schedule</p>
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
                  <span className="text-emerald-500 font-semibold">Easy ({easySolved} / 50)</span>
                  <span className="text-muted-foreground">{Math.round((easySolved / 50) * 100)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(easySolved / 50) * 100}%` }} />
                </div>
              </div>

              {/* Medium */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-amber-500 font-semibold">Medium ({mediumSolved} / 75)</span>
                  <span className="text-muted-foreground">{Math.round((mediumSolved / 75) * 100)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(mediumSolved / 75) * 100}%` }} />
                </div>
              </div>

              {/* Hard */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-rose-500 font-semibold">Hard ({hardSolved} / 25)</span>
                  <span className="text-muted-foreground">{Math.round((hardSolved / 25) * 100)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(hardSolved / 25) * 100}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Learning Tracks */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Track Progress</CardTitle>
                <CardDescription>Topics in progress</CardDescription>
              </div>
              <Link href="/patterns">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  <span>Browse by Topic</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="divide-y divide-border/60">
              {MOCK_TOPICS.slice(0, 3).map((topic) => {
                const completionPct = topic.completedCount
                  ? Math.round((topic.completedCount / topic.patternCount) * 100)
                  : 0;
                return (
                  <div key={topic.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-foreground">{topic.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {topic.completedCount || 0} of {topic.patternCount} patterns completed
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-24 hidden sm:block">
                        <Progress value={completionPct} />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground font-semibold">{completionPct}%</span>
                      <Link href={`/patterns?topic=${topic.slug}`}>
                        <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs">
                          Continue
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
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
                <Badge variant="secondary">{MOCK_REVISIONS.length} Due</Badge>
              </div>
              <CardDescription>Keep the algorithms fresh in your memory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_REVISIONS.map((rev) => (
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
              ))}
            </CardContent>
          </Card>

          {/* Quick links card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/patterns/two-pointers-converging" className="block">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted text-xs transition-colors">
                  <span className="font-medium text-foreground">Featured: Two Pointers</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </Link>
              <Link href="/problems" className="block">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted text-xs transition-colors">
                  <span className="font-medium text-foreground">LeetCode Problem Index</span>
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
    </div>
    </AuthGuard>
  );
}
