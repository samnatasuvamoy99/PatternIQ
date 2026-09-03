"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MOCK_TOPICS } from "@/lib/mock-data";
import { BookOpen, ArrowRight, Layers } from "lucide-react";

export default function TopicsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-border/60 pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-0.5 text-xs font-medium text-muted-foreground mb-2">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          <span>Curriculum Track</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Core DSA Topics</h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
          Explore structured problem-solving tracks from basic pointer manipulation to multi-dimensional dynamic programming.
        </p>
      </div>

      {/* Grid of Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_TOPICS.map((topic) => {
          const completed = topic.completedCount || 0;
          const percentage = Math.round((completed / topic.patternCount) * 100);

          return (
            <Card
              key={topic.id}
              className="flex flex-col justify-between hover:border-primary/50 transition-all hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                    <Layers className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {topic.patternCount} Patterns
                  </Badge>
                </div>
                <CardTitle className="text-xl mt-3">{topic.name}</CardTitle>
                <CardDescription className="text-xs line-clamp-3 mt-1 leading-relaxed">
                  {topic.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="space-y-1.5 border-t border-border/60 pt-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress: {completed} / {topic.patternCount}</span>
                    <span className="font-mono font-semibold text-foreground">{percentage}%</span>
                  </div>
                  <Progress value={percentage} />
                </div>

                <Link href={`/topics/${topic.slug}`} className="block">
                  <Button variant="outline" className="w-full justify-between text-xs">
                    <span>Explore Track Patterns</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
