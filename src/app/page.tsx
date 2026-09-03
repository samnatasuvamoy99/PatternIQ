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
} from "lucide-react";

export default function Home() {
  const featuredPattern = MOCK_PATTERNS[0];

  return (
    <div className="flex flex-col items-center justify-center">
      {/* HERO SECTION */}
      <section className="relative w-full overflow-hidden border-b border-border/40 py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm mb-6">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Structured Interview Mastery with Intuition First</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Stop Memorizing <span className="text-muted-foreground line-through">500 Questions</span>.
            <br />
            Master <span className="text-primary underline decoration-primary/40 underline-offset-8">DSA Patterns</span>.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Every technical interview question is derived from core patterns. Learn the identification rules, master multi-language templates, and lock them in your memory with automated spaced repetition.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2 h-11 px-6 text-base shadow-md">
                <span>Start Learning Free</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/patterns">
              <Button size="lg" variant="outline" className="h-11 px-6 text-base">
                Explore 14+ Patterns
              </Button>
            </Link>
          </div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-border/60 pt-10">
            <div>
              <p className="text-3xl font-black text-foreground">14+</p>
              <p className="text-xs font-medium text-muted-foreground mt-1">Core Patterns</p>
            </div>
            <div>
              <p className="text-3xl font-black text-primary">150+</p>
              <p className="text-xs font-medium text-muted-foreground mt-1">Curated Problems</p>
            </div>
            <div>
              <p className="text-3xl font-black text-foreground">4 Languages</p>
              <p className="text-xs font-medium text-muted-foreground mt-1">C++, Java, Python, JS</p>
            </div>
            <div>
              <p className="text-3xl font-black text-primary">100%</p>
              <p className="text-xs font-medium text-muted-foreground mt-1">Spaced Repetition</p>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE PATTERN PREVIEW CARD */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-2">How It Works</Badge>
          <h2 className="text-3xl font-bold tracking-tight">The Anatomy of a Pattern</h2>
          <p className="mt-2 text-muted-foreground text-sm max-w-xl mx-auto">
            Instead of brute forcing solutions, PatternIQ breaks down each algorithm into four fundamental pillars.
          </p>
        </div>

        <Card className="border-border/80 shadow-md overflow-hidden bg-card/60 backdrop-blur-sm">
          <div className="border-b border-border bg-muted/40 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
                #{featuredPattern.number}
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">{featuredPattern.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Topic: {featuredPattern.topicName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="easy">EASY</Badge>
              <Badge variant="outline">Time: {featuredPattern.complexity.time}</Badge>
              <Badge variant="outline">Space: {featuredPattern.complexity.space}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Left: Intuition & Identification */}
            <div className="p-6 space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-2">
                  <BrainCircuit className="h-4 w-4" /> Core Intuition
                </h4>
                <p className="text-sm text-foreground/90 leading-relaxed bg-muted/30 p-3.5 rounded-lg border border-border/50">
                  {featuredPattern.intuition}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                  <Target className="h-4 w-4" /> How to Identify in an Interview
                </h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {featuredPattern.identificationRules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                  <Award className="h-4 w-4" /> Benchmark LeetCode Problems
                </h4>
                <div className="space-y-1.5">
                  {featuredPattern.problems.map((prob) => (
                    <div
                      key={prob.id}
                      className="flex items-center justify-between text-xs p-2 rounded-md border border-border/50 bg-background/50"
                    >
                      <span className="font-medium text-foreground">{prob.title}</span>
                      <span className="text-muted-foreground font-mono">{prob.platform}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Pseudocode & Execution */}
            <div className="p-6 bg-muted/20 flex flex-col justify-between space-y-4">
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

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Available in C++, Java, Python, and JavaScript</span>
                <Link href={`/patterns/${featuredPattern.slug}`}>
                  <Button size="sm" className="gap-1.5">
                    <span>Explore Full Pattern</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* FEATURE PILLARS */}
      <section className="w-full border-t border-border bg-muted/20 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Built for Long-Term Recall</h2>
            <p className="mt-2 text-muted-foreground text-sm max-w-lg mx-auto">
              Our algorithm tracks your solving history and queues revisions right before forgetting occurs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Target className="h-5 w-5" />
              </div>
              <CardTitle>Pattern Recognition</CardTitle>
              <CardDescription>
                Categorize problems into actionable frameworks. Recognize two pointers, sliding window, or cyclic graphs in seconds.
              </CardDescription>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Repeat className="h-5 w-5" />
              </div>
              <CardTitle>Spaced Repetition Engine</CardTitle>
              <CardDescription>
                Scientific review intervals (1, 3, 7, 14, 30 days) automatically scheduled as you mark problems solved.
              </CardDescription>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Zap className="h-5 w-5" />
              </div>
              <CardTitle>Multi-Language Templates</CardTitle>
              <CardDescription>
                Clean, production-grade template implementations in C++, Java, Python, and JavaScript for each pattern.
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* TOPICS DIRECTORY PREVIEW */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Core Learning Tracks</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Start with linear techniques and progress to graph algorithms and dynamic programming.
            </p>
          </div>
          <Link href="/patterns">
            <Button variant="outline" size="sm" className="gap-1.5">
              <span>View All Patterns by Topic</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_TOPICS.map((topic) => (
            <Link key={topic.id} href={`/patterns?topic=${topic.slug}`}>
              <Card className="p-5 hover:border-primary/50 transition-all hover:shadow-md cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {topic.patternCount} Patterns
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="mt-3 font-bold text-base text-foreground group-hover:text-primary transition-colors">
                  {topic.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {topic.description}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="w-full border-t border-border bg-card py-16 px-4 text-center">
        <div className="mx-auto max-w-3xl space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Ready to Transform Your Technical Interview Prep?
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Join thousands of software engineers learning algorithms the systematic way. Free forever for students.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="gap-2">
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
