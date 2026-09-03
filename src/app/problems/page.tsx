"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_PATTERNS } from "@/lib/mock-data";
import { FileText, Search, ExternalLink, CheckCircle2, Layers } from "lucide-react";

export default function ProblemsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");

  // Flatten all problems with pattern metadata
  const allProblems = MOCK_PATTERNS.flatMap((pat) =>
    pat.problems.map((prob) => ({
      ...prob,
      patternName: pat.name,
      patternSlug: pat.slug,
      topicName: pat.topicName,
    }))
  );

  const [problemList, setProblemList] = useState(allProblems);

  const filteredProblems = problemList.filter((prob) => {
    const matchesSearch =
      prob.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prob.patternName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prob.platform.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDifficulty =
      difficultyFilter === "ALL" || prob.difficulty === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  const toggleSolved = (id: string) => {
    setProblemList((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const next = p.status === "SOLVED" ? "NOT_ATTEMPTED" : "SOLVED";
          return { ...p, status: next };
        }
        return p;
      })
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="border-b border-border/60 pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-0.5 text-xs font-medium text-muted-foreground mb-2">
          <FileText className="h-3.5 w-3.5 text-primary" />
          <span>Practice Index</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Curated Problem Set</h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
          High-yield LeetCode problems grouped by underlying patterns. Solve questions with clear conceptual templates.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search problems, patterns, platforms..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "EASY", "MEDIUM", "HARD"].map((diff) => (
            <Button
              key={diff}
              variant={difficultyFilter === diff ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficultyFilter(diff)}
              className="text-xs"
            >
              {diff}
            </Button>
          ))}
        </div>
      </div>

      {/* Problems Table / List Card */}
      <Card>
        <div className="divide-y divide-border/60">
          {filteredProblems.length > 0 ? (
            filteredProblems.map((prob) => (
              <div
                key={prob.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm sm:text-base text-foreground">
                      {prob.title}
                    </span>
                    <Badge variant={prob.difficulty === "EASY" ? "easy" : "medium"}>
                      {prob.difficulty}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground">
                      {prob.platform}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    <span>Pattern: </span>
                    <Link
                      href={`/patterns/${prob.patternSlug}`}
                      className="font-medium text-foreground hover:text-primary underline-offset-4 hover:underline"
                    >
                      {prob.patternName}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant={prob.status === "SOLVED" ? "default" : "outline"}
                    onClick={() => toggleSolved(prob.id)}
                    className="text-xs gap-1.5 h-8"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{prob.status === "SOLVED" ? "Solved" : "Mark Solved"}</span>
                  </Button>
                  <a
                    href={prob.solveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-border hover:bg-muted text-xs gap-1.5 font-medium text-foreground"
                  >
                    <span>Solve on LeetCode</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No problems match your current search or filter.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
