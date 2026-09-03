"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_TOPICS, MOCK_PATTERNS } from "@/lib/mock-data";
import { ArrowLeft, ArrowRight, Layers, Target, CheckCircle2 } from "lucide-react";

export default function TopicDetailPage({ params }: { params: { slug: string } }) {
  const topic = MOCK_TOPICS.find((t) => t.slug === params.slug);

  if (!topic) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">Topic Not Found</h1>
        <p className="text-muted-foreground">The requested topic does not exist.</p>
        <Link href="/topics">
          <Button variant="outline">Back to Topics</Button>
        </Link>
      </div>
    );
  }

  const patterns = MOCK_PATTERNS.filter((p) => p.topicSlug === topic.slug);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Back Button */}
      <Link href="/topics" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Topics Directory</span>
      </Link>

      {/* Topic Header Banner */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-card via-muted/20 to-primary/5 p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline">Topic Track #{topic.order}</Badge>
          <Badge variant="secondary">{topic.patternCount} Core Patterns</Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {topic.name}
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          {topic.description}
        </p>
      </div>

      {/* Patterns within this topic */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Track Curriculum</h2>
        <div className="grid grid-cols-1 gap-4">
          {patterns.length > 0 ? (
            patterns.map((pat) => (
              <Card key={pat.id} className="p-6 hover:border-primary/50 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
                      #{pat.number}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={pat.difficulty === "EASY" ? "easy" : "medium"}>
                          {pat.difficulty}
                        </Badge>
                        <Badge variant="outline">Time: {pat.complexity.time}</Badge>
                        <Badge variant="outline">Space: {pat.complexity.space}</Badge>
                        {pat.status === "MASTERED" && (
                          <Badge variant="solved" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Mastered
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-foreground">{pat.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 max-w-xl">
                        {pat.summary}
                      </p>
                    </div>
                  </div>

                  <Link href={`/patterns/${pat.slug}`} className="shrink-0">
                    <Button size="sm" className="gap-1.5 w-full sm:w-auto">
                      <span>Study Pattern</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center text-muted-foreground text-sm">
              More patterns for this track will be published soon.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
