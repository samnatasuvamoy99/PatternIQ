"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CodeViewer } from "@/components/ui/code-viewer";
import { MOCK_TOPICS, MOCK_PATTERNS } from "@/lib/mock-data";
import {
  Layers,
  ArrowRight,
  CheckCircle2,
  Zap,
  Target,
  Repeat,
  Code2,
  BrainCircuit,
  Sparkles,
  Award,
  BookOpen,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  const featuredPattern = MOCK_PATTERNS[0];

  return (
    <div className="flex flex-col items-center justify-center">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden border-b border-border/40 py-24 md:py-36">
        {/* Landing Graphic Background with Light & Dark Mode Optimization */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 dark:opacity-20 dark:brightness-75 pointer-events-none transition-opacity duration-300"
          style={{ backgroundImage: "url('/landing-bg.png')" }}
        />
        {/* Radial and Vertical Vignette for High-Contrast Text Legibility */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-background/30 via-background/80 to-background pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
          {/* Primary Headline */}
          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.12]">
            Stop Memorizing{" "}
            <span className="text-muted-foreground/60 line-through decoration-destructive/50">
              500 Questions
            </span>
            .<br />
            Master{" "}
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
              DSA Patterns
            </span>
            .
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground font-normal leading-relaxed">
            Every technical interview question is derived from foundational patterns. Learn the identification triggers, master multi-language templates, and commit them to memory with automated spaced repetition.
          </p>

          {/* Action Buttons */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2 h-12 px-7 text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <span>Start Learning Free</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/patterns">
              <Button size="lg" variant="outline" className="h-12 px-7 text-sm font-semibold border-border/80 bg-background/70 backdrop-blur-sm hover:bg-muted/80 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <span>Explore 14+ Patterns</span>
              </Button>
            </Link>
          </div>

          {/* Stats Strip */}
          <div className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-6">
            <div className="p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xs space-y-1">
              <p className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">14+</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Core Patterns</p>
            </div>
            <div className="p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xs space-y-1">
              <p className="font-heading text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">150+</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Curated Problems</p>
            </div>
            <div className="p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xs space-y-1">
              <p className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">4 Languages</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">C++, Java, Python, JS</p>
            </div>
            <div className="p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xs space-y-1">
              <p className="font-heading text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">100%</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Active Recall</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE PATTERN PREVIEW */}
      {/* ========================================================================= */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-12 space-y-2">
          <Badge variant="outline" className="border-primary/30 text-primary px-3 py-0.5 text-xs font-semibold">
            How It Works
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            The Anatomy of an Algorithmic Pattern
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
            Instead of memorizing bespoke solutions, PatternIQ deconstructs every challenge into four core foundational pillars.
          </p>
        </div>

        <Card className="border-border/80 shadow-xl overflow-hidden bg-card/80 backdrop-blur-sm">
          <div className="border-b border-border bg-muted/40 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm font-mono text-base">
                #{featuredPattern.number}
              </div>
              <div>
                <h3 className="font-heading font-bold text-xl leading-tight text-foreground">{featuredPattern.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">Topic: {featuredPattern.topicName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="easy">EASY</Badge>
              <Badge variant="outline" className="font-mono text-[11px]">Time: {featuredPattern.complexity.time}</Badge>
              <Badge variant="outline" className="font-mono text-[11px]">Space: {featuredPattern.complexity.space}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Left: Intuition & Identification */}
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-2.5">
                  <BrainCircuit className="h-4 w-4" /> The Mental Model (Intuition)
                </h4>
                <p className="text-sm text-foreground/90 leading-relaxed bg-muted/30 p-4 rounded-xl border border-border/60">
                  {featuredPattern.intuition}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2.5">
                  <Target className="h-4 w-4 text-emerald-500" /> How to Identify in an Interview
                </h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {featuredPattern.identificationRules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2.5">
                  <Award className="h-4 w-4 text-amber-500" /> Benchmark Practice Problems
                </h4>
                <div className="space-y-2">
                  {featuredPattern.problems.map((prob) => (
                    <div
                      key={prob.id}
                      className="flex items-center justify-between text-xs p-2.5 rounded-lg border border-border/60 bg-background/50"
                    >
                      <span className="font-semibold text-foreground">{prob.title}</span>
                      <span className="text-muted-foreground font-mono text-[11px]">{prob.platform}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Pseudocode & Multi-Language Blueprint */}
            <div className="p-6 sm:p-8 bg-muted/20 flex flex-col justify-between space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
                  <Code2 className="h-4 w-4 text-primary" /> Pseudocode Blueprint
                </h4>
                <CodeViewer
                  code={featuredPattern.pseudocode}
                  language="pseudocode"
                  title="two-sum-sorted.algo"
                />
              </div>

              <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>Production templates ready in Python, C++, Java, JS</span>
                <Link href={`/patterns/${featuredPattern.slug}`}>
                  <Button size="sm" className="gap-1.5 text-xs font-semibold h-9">
                    <span>Explore Full Pattern</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* ========================================================================= */}
      {/* 3. FEATURE PILLARS */}
      {/* ========================================================================= */}
      <section className="w-full border-t border-border bg-muted/20 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-2">
            <Badge variant="outline" className="border-border text-muted-foreground px-3 py-0.5 text-xs font-semibold">
              Scientific Retention
            </Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Engineered for Long-Term Recall
            </h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
              Our spaced repetition engine queues active recall revisions just before memory decay occurs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-7 space-y-4 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Target className="h-6 w-6" />
              </div>
              <CardTitle className="font-heading font-bold text-xl">Pattern Recognition</CardTitle>
              <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                Categorize problems into actionable frameworks. Recognize Two Pointers, Sliding Window, or Monotonic Stacks in under 30 seconds.
              </CardDescription>
            </Card>

            <Card className="p-7 space-y-4 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Repeat className="h-6 w-6" />
              </div>
              <CardTitle className="font-heading font-bold text-xl">Spaced Repetition Engine</CardTitle>
              <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                Scientific review intervals (1, 3, 7, 14, 30 days) automatically scheduled as you solve problems and rate difficulty.
              </CardDescription>
            </Card>

            <Card className="p-7 space-y-4 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Zap className="h-6 w-6" />
              </div>
              <CardTitle className="font-heading font-bold text-xl">Multi-Language Templates</CardTitle>
              <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                Clean, battle-tested code templates in C++, Java, Python, and JavaScript with line-by-line breakdown of invariants.
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CURRICULUM TRACKS PREVIEW */}
      {/* ========================================================================= */}
      <section className="w-full py-24 px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div className="space-y-1">
            <Badge variant="outline" className="border-border text-muted-foreground px-3 py-0.5 text-xs font-semibold">
              Curriculum Tracks
            </Badge>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Structured Algorithm Tracks
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Start with linear array techniques and progress to graph traversals and dynamic programming.
            </p>
          </div>
          <Link href="/patterns">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold h-9">
              <span>View Live Catalog</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_TOPICS.map((topic) => (
            <Link key={topic.id} href={`/patterns?topic=${topic.slug}`}>
              <Card className="p-6 hover:border-primary/50 transition-all hover:shadow-md cursor-pointer group hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors font-mono">
                    {topic.patternCount} Patterns
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="mt-4 font-heading font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                  {topic.name}
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {topic.description}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CTA SECTION */}
      {/* ========================================================================= */}
      <section className="w-full border-t border-border bg-card py-20 px-4 text-center">
        <div className="mx-auto max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Accelerate Your Career</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Ready to Transform Your Technical Interview Prep?
          </h2>

          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Join thousands of software engineers mastering algorithms systematically. Free forever for students.
          </p>

          <div className="pt-3 flex justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="gap-2 h-12 px-8 text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <span>Create Your Free Account</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
