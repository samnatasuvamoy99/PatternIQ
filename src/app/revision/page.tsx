"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeViewer } from "@/components/ui/code-viewer";
import { MOCK_REVISIONS, MOCK_PATTERNS } from "@/lib/mock-data";
import {
  Repeat,
  CheckCircle2,
  SkipForward,
  BrainCircuit,
  Code2,
  Calendar,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

export default function RevisionPage() {
  const [revisions, setRevisions] = useState(MOCK_REVISIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  const currentRev = revisions[currentIndex];
  const patternDetail = currentRev
    ? MOCK_PATTERNS.find((p) => p.id === currentRev.patternId) || MOCK_PATTERNS[0]
    : null;

  const handleMarkComplete = () => {
    setCompletedCount((prev) => prev + 1);
    setShowDetails(false);
    if (currentIndex < revisions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setRevisions([]);
    }
  };

  const handleSkip = () => {
    setShowDetails(false);
    if (currentIndex < revisions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Daily Pattern Revision
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Recall intuition and pseudocode without looking at the solution to reinforce neural pathways.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs px-3 py-1">
            Completed: {completedCount}
          </Badge>
          <Badge variant="secondary" className="text-xs px-3 py-1">
            Remaining: {revisions.length > 0 ? revisions.length - currentIndex : 0}
          </Badge>
        </div>
      </div>

      {/* FLASHCARD INTERFACE */}
      {revisions.length > 0 && currentRev && patternDetail ? (
        <Card className="border-border/80 shadow-lg overflow-hidden bg-card transition-all">
          <CardHeader className="bg-muted/30 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={currentRev.difficulty === "EASY" ? "easy" : "medium"}>
                  {currentRev.difficulty}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Repetition #{currentRev.repetitionCount} • Interval: {currentRev.intervalDays} Days
                </span>
              </div>
              <span className="text-xs font-mono font-semibold text-muted-foreground">
                Card {currentIndex + 1} of {revisions.length}
              </span>
            </div>
            <CardTitle className="text-xl sm:text-2xl mt-2 font-bold text-foreground">
              {currentRev.patternName}
            </CardTitle>
            <CardDescription>Topic: {currentRev.topicName}</CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Prompt Challenge */}
            <div className="rounded-xl border border-border/80 bg-muted/20 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-primary" />
                <span>Active Recall Challenge:</span>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                1. What is the fundamental condition that dictates pointer movement or window resizing?
                <br />
                2. Can you formulate the pseudocode algorithm from memory?
              </p>
            </div>

            {/* Toggle Revelation Button */}
            {!showDetails ? (
              <div className="text-center py-6">
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(true)}
                  className="gap-2 shadow-sm"
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Reveal Intuition & Pseudocode Blueprint</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in-50 duration-200">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-1.5 flex items-center gap-1.5">
                    <BrainCircuit className="h-4 w-4" /> Core Intuition
                  </h4>
                  <p className="text-sm text-foreground/90 bg-muted/30 p-3.5 rounded-lg border border-border/50">
                    {patternDetail.intuition}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Code2 className="h-4 w-4 text-primary" /> Pseudocode Verification
                  </h4>
                  <CodeViewer
                    code={patternDetail.pseudocode}
                    language="pseudocode"
                    title={`${patternDetail.slug}.algo`}
                  />
                </div>

                <div className="flex justify-end">
                  <Link href={`/patterns/${patternDetail.slug}`} target="_blank">
                    <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary">
                      <span>View Full Code Templates</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="bg-muted/20 border-t border-border/60 p-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleSkip} className="gap-1.5 text-muted-foreground">
              <SkipForward className="h-4 w-4" />
              <span>Skip for Now</span>
            </Button>
            <Button onClick={handleMarkComplete} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
              <CheckCircle2 className="h-4 w-4" />
              <span>Mastered / Mark Complete</span>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        /* Empty State */
        <Card className="p-12 text-center space-y-4 border-dashed">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold">All caught up for today! 🎉</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            You have reviewed all your scheduled patterns. Your next spaced repetition session will be queued automatically as you solve more problems.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
            <Link href="/patterns">
              <Button>Study New Patterns</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* HOW SPACED REPETITION WORKS INFO CARD */}
      <Card className="p-6 bg-muted/10">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span>The Spaced Repetition Schedule</span>
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          When you mark a problem solved under a pattern, PatternIQ schedules review sessions at progressively longer intervals: <strong>Day 1 → Day 3 → Day 7 → Day 14 → Day 30</strong>. This actively combats the Ebbinghaus forgetting curve so your recall remains sharp during real-world interviews.
        </p>
      </Card>
    </div>
  );
}
