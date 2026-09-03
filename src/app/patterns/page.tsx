"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_PATTERNS } from "@/lib/mock-data";
import { Layers, Search, ArrowRight, CheckCircle2, Clock } from "lucide-react";

export default function PatternsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");

  const filteredPatterns = MOCK_PATTERNS.filter((pattern) => {
    const matchesSearch =
      pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pattern.topicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pattern.summary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDifficulty =
      difficultyFilter === "ALL" || pattern.difficulty === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="border-b border-border/60 pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-0.5 text-xs font-medium text-muted-foreground mb-2">
          <Layers className="h-3.5 w-3.5 text-primary" />
          <span>Pattern Catalog</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">DSA Pattern Repository</h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
          Master the underlying algorithm structure behind 90% of technical interview questions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patterns or keywords..."
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

      {/* Pattern Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPatterns.map((pat) => (
          <Card key={pat.id} className="flex flex-col justify-between hover:border-primary/50 transition-all hover:shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                    #{pat.number}
                  </span>
                  <Badge variant={pat.difficulty === "EASY" ? "easy" : "medium"}>
                    {pat.difficulty}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {pat.topicName}
                </span>
              </div>
              <CardTitle className="text-lg mt-2 text-foreground">{pat.name}</CardTitle>
              <CardDescription className="text-xs line-clamp-2 leading-relaxed">
                {pat.summary}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border/50 pt-3">
                <span>Time: <strong className="text-foreground">{pat.complexity.time}</strong></span>
                <span>•</span>
                <span>Space: <strong className="text-foreground">{pat.complexity.space}</strong></span>
                <span>•</span>
                <span>{pat.problems.length} Problems</span>
              </div>

              <Link href={`/patterns/${pat.slug}`} className="block">
                <Button variant="outline" size="sm" className="w-full justify-between text-xs">
                  <span>View Intuition & Code Templates</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
