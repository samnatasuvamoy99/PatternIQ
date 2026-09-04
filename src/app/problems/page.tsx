"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { AuthGuard } from "@/components/auth/auth-guard";
import { MOCK_TOPICS, MOCK_PATTERNS } from "@/lib/mock-data";
import {
  FileText,
  Search,
  ExternalLink,
  CheckCircle2,
  Circle,
  Star,
  Play,
  Layers,
  ChevronDown,
  Target,
  Maximize2,
  Zap,
  GitBranch,
  Sparkles,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TOPIC_ICONS: Record<string, any> = {
  "two-pointers": Target,
  "sliding-window": Maximize2,
  "fast-slow-pointers": Zap,
  "binary-search": Search,
  "tree-bfs-dfs": GitBranch,
  "dynamic-programming": Layers,
};

interface ProblemItem {
  id: string;
  title: string;
  slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  platform: string;
  solveUrl: string;
  orderIndex: number;
  status: "SOLVED" | "ATTEMPTED" | "NOT_ATTEMPTED";
  isStarred?: boolean;
}

interface PatternWithProblems {
  id: string;
  number: number;
  name: string;
  slug: string;
  topicSlug: string;
  difficulty: string;
  summary: string;
  complexity: { time: string; space: string };
  problems: ProblemItem[];
}

interface TopicWithPatterns {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  patterns: PatternWithProblems[];
}

export default function ProblemsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL"); // ALL, SOLVED, UNSOLVED, STARRED

  // Expanded topics state (default first 2 topics expanded)
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>(() => ({
    [MOCK_TOPICS[0].slug]: true,
    [MOCK_TOPICS[1]?.slug || ""]: true,
  }));

  // Expanded patterns state (default all expanded under opened topics)
  const [expandedPatterns, setExpandedPatterns] = useState<Record<string, boolean>>(() => {
    const defaultExp: Record<string, boolean> = {};
    MOCK_PATTERNS.forEach((p) => {
      defaultExp[p.id] = true;
    });
    return defaultExp;
  });

  // State to track problem statuses and starred problems
  const [problemStates, setProblemStates] = useState<Record<string, { status: string; isStarred: boolean }>>(() => {
    const initial: Record<string, { status: string; isStarred: boolean }> = {};
    MOCK_PATTERNS.forEach((pat) => {
      pat.problems.forEach((prob, idx) => {
        initial[prob.id] = {
          status: prob.status || "NOT_ATTEMPTED",
          isStarred: idx === 0, // demo default star first problem
        };
      });
    });
    return initial;
  });

  // Toggle problem solved checkmark
  const toggleSolved = (probId: string) => {
    setProblemStates((prev) => {
      const current = prev[probId] || { status: "NOT_ATTEMPTED", isStarred: false };
      const nextStatus = current.status === "SOLVED" ? "NOT_ATTEMPTED" : "SOLVED";
      return {
        ...prev,
        [probId]: { ...current, status: nextStatus },
      };
    });
  };

  // Toggle star / bookmark on problem
  const toggleStarred = (probId: string) => {
    setProblemStates((prev) => {
      const current = prev[probId] || { status: "NOT_ATTEMPTED", isStarred: false };
      return {
        ...prev,
        [probId]: { ...current, isStarred: !current.isStarred },
      };
    });
  };

  const toggleTopic = (slug: string) => {
    setExpandedTopics((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const togglePattern = (patternId: string) => {
    setExpandedPatterns((prev) => ({ ...prev, [patternId]: !prev[patternId] }));
  };

  const expandAll = () => {
    const allT: Record<string, boolean> = {};
    const allP: Record<string, boolean> = {};
    MOCK_TOPICS.forEach((t) => (allT[t.slug] = true));
    MOCK_PATTERNS.forEach((p) => (allP[p.id] = true));
    setExpandedTopics(allT);
    setExpandedPatterns(allP);
  };

  const collapseAll = () => {
    setExpandedTopics({});
    setExpandedPatterns({});
  };

  // Build the hierarchical Topic -> Pattern -> Problems tree with live states
  const hierarchy: TopicWithPatterns[] = useMemo(() => {
    return MOCK_TOPICS.map((topic) => {
      const topicPats = MOCK_PATTERNS.filter((p) => p.topicSlug === topic.slug).map((pat) => {
        const enrichedProbs: ProblemItem[] = pat.problems.map((prob) => {
          const state = problemStates[prob.id] || { status: prob.status, isStarred: false };
          return {
            ...prob,
            status: state.status as "SOLVED" | "ATTEMPTED" | "NOT_ATTEMPTED",
            isStarred: state.isStarred,
          };
        });

        return {
          id: pat.id,
          number: pat.number,
          name: pat.name,
          slug: pat.slug,
          topicSlug: pat.topicSlug,
          difficulty: pat.difficulty,
          summary: pat.summary,
          complexity: pat.complexity,
          problems: enrichedProbs,
        };
      });

      return {
        id: topic.id,
        name: topic.name,
        slug: topic.slug,
        description: topic.description,
        order: topic.order,
        patterns: topicPats,
      };
    });
  }, [problemStates]);

  // Compute overall global progress statistics
  const stats = useMemo(() => {
    let total = 0;
    let solved = 0;
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;

    hierarchy.forEach((t) => {
      t.patterns.forEach((p) => {
        p.problems.forEach((prob) => {
          total++;
          if (prob.status === "SOLVED") {
            solved++;
            if (prob.difficulty === "EASY") easySolved++;
            if (prob.difficulty === "MEDIUM") mediumSolved++;
            if (prob.difficulty === "HARD") hardSolved++;
          }
        });
      });
    });

    const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;
    return { total, solved, percentage, easySolved, mediumSolved, hardSolved };
  }, [hierarchy]);

  // Filter the hierarchy based on search query, difficulty, and status
  const filteredHierarchy = useMemo(() => {
    return hierarchy
      .map((topic) => {
        const filteredPatterns = topic.patterns
          .map((pat) => {
            const filteredProblems = pat.problems.filter((prob) => {
              // Search match
              const matchesSearch =
                !searchTerm ||
                prob.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prob.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                topic.name.toLowerCase().includes(searchTerm.toLowerCase());

              // Difficulty match
              const matchesDiff =
                difficultyFilter === "ALL" || prob.difficulty === difficultyFilter;

              // Status match
              let matchesStatus = true;
              if (statusFilter === "SOLVED") matchesStatus = prob.status === "SOLVED";
              if (statusFilter === "UNSOLVED") matchesStatus = prob.status !== "SOLVED";
              if (statusFilter === "STARRED") matchesStatus = !!prob.isStarred;

              return matchesSearch && matchesDiff && matchesStatus;
            });

            return {
              ...pat,
              problems: filteredProblems,
            };
          })
          .filter((pat) => {
            // Keep pattern if it has matching problems, or if searching and pattern name matches
            if (pat.problems.length > 0) return true;
            if (searchTerm && pat.name.toLowerCase().includes(searchTerm.toLowerCase())) return true;
            return false;
          });

        return {
          ...topic,
          patterns: filteredPatterns,
        };
      })
      .filter((topic) => {
        // Keep topic if it has matching patterns
        if (topic.patterns.length > 0) return true;
        if (searchTerm && topic.name.toLowerCase().includes(searchTerm.toLowerCase())) return true;
        return false;
      });
  }, [hierarchy, searchTerm, difficultyFilter, statusFilter]);

  return (
    <AuthGuard>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="border-b border-border/60 pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Curated Problems Catalog</h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
          Organized hierarchically by <strong>Topics</strong> &rarr; <strong>Patterns</strong> &rarr; <strong>Problems</strong>.
        </p>
      </div>

      {/* OVERALL PROGRESS BANNER */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-card via-muted/20 to-primary/5 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm font-bold">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                Your Practice Completion
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                <span className="font-semibold text-foreground font-mono">{stats.solved}</span> of{" "}
                <span className="font-mono">{stats.total}</span> problems solved ({stats.percentage}%)
              </p>
            </div>
          </div>

          {/* Difficulty breakdown pills */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="rounded-lg border border-border bg-card px-3 py-1.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Easy:</span>
              <span className="font-mono font-semibold">{stats.easySolved}</span>
            </div>
            <div className="rounded-lg border border-border bg-card px-3 py-1.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">Medium:</span>
              <span className="font-mono font-semibold">{stats.mediumSolved}</span>
            </div>
            <div className="rounded-lg border border-border bg-card px-3 py-1.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="text-muted-foreground">Hard:</span>
              <span className="font-mono font-semibold">{stats.hardSolved}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>

      {/* FILTER & CONTROLS BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search problems, patterns, topics..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters and View Controls */}
        <div className="flex items-center gap-3 flex-wrap justify-between lg:justify-end">
          {/* Status Filter */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 text-xs">
            {(["ALL", "UNSOLVED", "SOLVED", "STARRED"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium",
                  statusFilter === st
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {st === "STARRED" ? "★ Starred" : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1">
            {["ALL", "EASY", "MEDIUM", "HARD"].map((diff) => (
              <Button
                key={diff}
                variant={difficultyFilter === diff ? "default" : "outline"}
                size="sm"
                onClick={() => setDifficultyFilter(diff)}
                className="text-xs h-8 px-2.5"
              >
                {diff}
              </Button>
            ))}
          </div>

          {/* Expand / Collapse All */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-l border-border/80 pl-3">
            <button
              onClick={expandAll}
              className="hover:text-foreground underline-offset-4 hover:underline cursor-pointer"
            >
              Expand All
            </button>
            <span>•</span>
            <button
              onClick={collapseAll}
              className="hover:text-foreground underline-offset-4 hover:underline cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* HIERARCHICAL TOPIC -> PATTERN -> PROBLEMS LIST */}
      <div className="space-y-6">
        {filteredHierarchy.length > 0 ? (
          filteredHierarchy.map((topic) => {
            const isTopicExpanded = !!expandedTopics[topic.slug];
            const Icon = TOPIC_ICONS[topic.slug] || Layers;

            // Compute topic stats
            let topicTotalProbs = 0;
            let topicSolvedProbs = 0;
            topic.patterns.forEach((pat) => {
              pat.problems.forEach((prob) => {
                topicTotalProbs++;
                if (prob.status === "SOLVED") topicSolvedProbs++;
              });
            });
            const topicPct =
              topicTotalProbs > 0 ? Math.round((topicSolvedProbs / topicTotalProbs) * 100) : 0;

            return (
              <div
                key={topic.id}
                className={cn(
                  "rounded-2xl border transition-all duration-200 overflow-hidden bg-card",
                  isTopicExpanded
                    ? "border-border shadow-sm ring-1 ring-border/50"
                    : "border-border/80 hover:border-primary/40"
                )}
              >
                {/* 1. TOPIC HEADER ROW */}
                <button
                  type="button"
                  onClick={() => toggleTopic(topic.slug)}
                  className="w-full text-left p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors border-b border-border/60"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold transition-colors",
                        isTopicExpanded
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider font-mono">
                          Track #{topic.order}
                        </span>
                        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground">
                          {topic.name}
                        </h2>
                        <Badge variant="secondary" className="text-xs">
                          {topic.patterns.length} Patterns
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {topic.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Progress & Chevron */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-24 hidden sm:block">
                        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${topicPct}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground font-semibold">
                        {topicSolvedProbs}/{topicTotalProbs} Solved
                      </span>
                    </div>

                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-transform duration-200",
                        isTopicExpanded ? "bg-primary/10 text-primary rotate-180 border-primary/30" : "hover:bg-muted"
                      )}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </button>

                {/* 2. TOPIC BODY: LIST OF PATTERNS */}
                {isTopicExpanded && (
                  <div className="p-4 sm:p-6 space-y-5 bg-muted/5 animate-in slide-in-from-top-1 duration-200">
                    {topic.patterns.length > 0 ? (
                      topic.patterns.map((pattern) => {
                        const isPatternExpanded = !!expandedPatterns[pattern.id];
                        const patSolved = pattern.problems.filter((p) => p.status === "SOLVED").length;

                        return (
                          <div
                            key={pattern.id}
                            className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs"
                          >
                            {/* PATTERN HEADER ROW */}
                            <button
                              type="button"
                              onClick={() => togglePattern(pattern.id)}
                              className="w-full text-left p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card hover:bg-muted/30 transition-colors select-none cursor-pointer border-b border-border/50"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary text-xs font-bold font-mono">
                                  #{pattern.number}
                                </span>

                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-sm sm:text-base font-bold text-foreground">
                                      {pattern.name}
                                    </h3>
                                    <Badge variant={pattern.difficulty === "EASY" ? "easy" : "medium"}>
                                      {pattern.difficulty}
                                    </Badge>
                                    <Badge variant="outline" className="text-[11px] font-mono">
                                      {pattern.complexity.time}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                                  <span className="text-foreground font-semibold">{patSolved}</span> of{" "}
                                  <span>{pattern.problems.length} solved</span>
                                </div>

                                <Link
                                  href={`/patterns/${pattern.slug}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs text-primary hover:underline flex items-center gap-1 font-medium mr-1"
                                >
                                  <span>Study Pattern</span>
                                </Link>

                                <div
                                  className={cn(
                                    "flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-transform duration-200",
                                    isPatternExpanded ? "rotate-180 text-primary" : ""
                                  )}
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </div>
                              </div>
                            </button>

                            {/* 3. LIST OF QUESTIONS / PROBLEMS UNDER PATTERN */}
                            {isPatternExpanded && (
                              <div className="divide-y divide-border/50 bg-background/50">
                                {pattern.problems.length > 0 ? (
                                  pattern.problems.map((prob) => {
                                    const isSolved = prob.status === "SOLVED";

                                    return (
                                      <div
                                        key={prob.id}
                                        className={cn(
                                          "p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors",
                                          isSolved ? "bg-emerald-500/5" : "hover:bg-muted/30"
                                        )}
                                      >
                                        {/* Left: Checkmark + Title + Platform */}
                                        <div className="flex items-start sm:items-center gap-3 min-w-0">
                                          {/* CHECKMARK OPTION */}
                                          <button
                                            type="button"
                                            onClick={() => toggleSolved(prob.id)}
                                            className={cn(
                                              "mt-0.5 sm:mt-0 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all cursor-pointer",
                                              isSolved
                                                ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                                                : "border-border hover:border-emerald-500/60 bg-background text-transparent hover:text-muted-foreground/30"
                                            )}
                                            title={isSolved ? "Mark as unsolved" : "Mark as solved"}
                                          >
                                            <CheckCircle2 className="h-4 w-4" />
                                          </button>

                                          {/* STAR / BOOKMARK OPTION */}
                                          <button
                                            type="button"
                                            onClick={() => toggleStarred(prob.id)}
                                            className={cn(
                                              "flex h-6 w-6 shrink-0 items-center justify-center rounded transition-colors cursor-pointer",
                                              prob.isStarred
                                                ? "text-amber-400 hover:text-amber-500"
                                                : "text-muted-foreground/40 hover:text-amber-400"
                                            )}
                                            title={prob.isStarred ? "Remove from starred" : "Star problem"}
                                          >
                                            <Star className={cn("h-4 w-4", prob.isStarred && "fill-current")} />
                                          </button>

                                          <div className="space-y-0.5 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span
                                                className={cn(
                                                  "text-sm font-semibold transition-all",
                                                  isSolved
                                                    ? "line-through text-muted-foreground"
                                                    : "text-foreground"
                                                )}
                                              >
                                                {prob.title}
                                              </span>
                                              <Badge variant={prob.difficulty === "EASY" ? "easy" : "medium"}>
                                                {prob.difficulty}
                                              </Badge>
                                            </div>
                                            <span className="text-xs font-mono text-muted-foreground block">
                                              {prob.platform}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Right: Solved status + START BUTTON */}
                                        <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pl-9 sm:pl-0">
                                          {isSolved && (
                                            <Badge variant="solved" className="text-[11px] gap-1 py-0.5">
                                              <CheckCircle2 className="h-3 w-3" /> Solved
                                            </Badge>
                                          )}

                                          {/* START / SOLVE BUTTON */}
                                          <a
                                            href={prob.solveUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs transition-all cursor-pointer"
                                            title="Open problem in LeetCode"
                                          >
                                            <Play className="h-3 w-3 fill-current" />
                                            <span>Start</span>
                                            <ExternalLink className="h-3 w-3 opacity-70" />
                                          </a>
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="p-4 text-center text-xs text-muted-foreground">
                                    No problems match your filter under this pattern.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-xs text-muted-foreground">
                        No patterns or problems match your search criteria.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <Card className="p-12 text-center text-muted-foreground text-sm border-dashed">
            <p>No questions found matching your filter criteria.</p>
            <p className="text-xs mt-1">Try resetting the search query or difficulty filters.</p>
          </Card>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}
