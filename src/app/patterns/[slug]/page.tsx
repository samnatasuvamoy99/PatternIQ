"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";
import { MOCK_PATTERNS, ProblemData, PatternData } from "@/lib/mock-data";
import {
  ArrowLeft,
  BrainCircuit,
  Target,
  Code2,
  ExternalLink,
  CheckCircle2,
  BookOpen,
  Copy,
  Check,
  PlusCircle,
  Trash2,
  Loader2,
} from "lucide-react";

export default function PatternDetailPage({ params }: { params: { slug: string } }) {
  const fallbackPattern =
    MOCK_PATTERNS.find((p) => p.slug === params.slug) || MOCK_PATTERNS[0];

  const [pattern, setPattern] = useState<PatternData>(fallbackPattern);
  const [problems, setProblems] = useState<ProblemData[]>(fallbackPattern.problems);
  const [copiedLang, setCopiedLang] = useState<string | null>(null);
  const [notes, setNotes] = useState<string[]>([
    "Remember: Left pointer increments when sum < target; right pointer decrements when sum > target.",
  ]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch live pattern from API
  useEffect(() => {
    async function loadPattern() {
      setIsLoading(true);
      try {
        const res = await apiClient<any>(`/patterns/${params.slug}`);
        if (res.success && res.data) {
          const apiData = res.data;
          const mapped: PatternData = {
            id: apiData.id,
            number: apiData.number || 1,
            name: apiData.name,
            slug: apiData.slug,
            topicSlug: apiData.topic?.slug || "array",
            topicName: apiData.topic?.name || "Array Patterns",
            difficulty: apiData.difficulty || "MEDIUM",
            importance: apiData.importance || 5,
            summary: apiData.shortDescription || apiData.whatIsThis || fallbackPattern.summary,
            intuition: apiData.intuition || apiData.coreIdea || fallbackPattern.intuition,
            identificationRules: apiData.interviewRule
              ? [apiData.interviewRule]
              : fallbackPattern.identificationRules,
            approachSteps: fallbackPattern.approachSteps,
            complexity: {
              time: apiData.timeComplexity || "O(N)",
              space: apiData.spaceComplexity || "O(1)",
            },
            pseudocode: apiData.pseudocode || fallbackPattern.pseudocode,
            codeTemplates: {
              cpp: apiData.cppTemplate || fallbackPattern.codeTemplates.cpp,
              java: apiData.javaTemplate || fallbackPattern.codeTemplates.java,
              python: apiData.pyTemplate || fallbackPattern.codeTemplates.python,
              javascript: apiData.jsTemplate || fallbackPattern.codeTemplates.javascript,
            },
            problems:
              apiData.problems && apiData.problems.length > 0
                ? apiData.problems.map((pItem: any, idx: number) => ({
                    id: pItem.problem?.id || pItem.id || `prob-${idx}`,
                    title: pItem.problem?.title || "Practice Problem",
                    slug: pItem.problem?.slug || "problem",
                    difficulty: pItem.problem?.difficulty || "MEDIUM",
                    platform: pItem.problem?.platform || "LeetCode",
                    solveUrl: pItem.problem?.url || "https://leetcode.com",
                    orderIndex: pItem.order || idx + 1,
                    status: "NOT_ATTEMPTED",
                  }))
                : fallbackPattern.problems,
            status: apiData.userProgress?.status || "IN_PROGRESS",
          };
          setPattern(mapped);
          setProblems(mapped.problems);
        }
      } catch (e) {
        console.error("Using fallback pattern data", e);
      } finally {
        setIsLoading(false);
      }
    }

    loadPattern();
  }, [params.slug]);

  const copyCode = (code: string, lang: string) => {
    navigator.clipboard.writeText(code);
    setCopiedLang(lang);
    setTimeout(() => setCopiedLang(null), 2000);
  };

  const toggleProblemStatus = async (problemId: string) => {
    setProblems((prev) =>
      prev.map((prob) => {
        if (prob.id === problemId) {
          const nextStatus = prob.status === "SOLVED" ? "ATTEMPTED" : "SOLVED";
          return { ...prob, status: nextStatus };
        }
        return prob;
      })
    );

    // Call progress API in background
    apiClient("/progress/problem", {
      method: "POST",
      body: JSON.stringify({
        problemId,
        status: "SOLVED",
      }),
    }).catch(() => {});
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotes((prev) => [...prev, newNote.trim()]);
    setNewNote("");
  };

  const handleDeleteNote = (index: number) => {
    setNotes((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Back link */}
      <Link href="/patterns" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to All Patterns</span>
      </Link>

      {/* Pattern Hero Header */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-card via-muted/20 to-primary/5 p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              #{pattern.number}
            </span>
            <Badge variant={pattern.difficulty === "EASY" ? "easy" : "medium"}>
              {pattern.difficulty}
            </Badge>
            <Badge variant="outline">Time: {pattern.complexity.time}</Badge>
            <Badge variant="outline">Space: {pattern.complexity.space}</Badge>
          </div>
          <Link href={`/patterns?topic=${pattern.topicSlug}`}>
            <Button variant="outline" size="sm" className="text-xs">
              Topic: {pattern.topicName}
            </Button>
          </Link>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {pattern.name}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
          {pattern.summary}
        </p>
      </div>

      {/* MAIN TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Tabs for Intuition, Pseudocode, and Multi-Language Code */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="intuition" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="intuition">Intuition & Rules</TabsTrigger>
              <TabsTrigger value="pseudocode">Pseudocode</TabsTrigger>
              <TabsTrigger value="templates">Code Templates</TabsTrigger>
            </TabsList>

            {/* TAB 1: Intuition & Identification */}
            <TabsContent value="intuition" className="space-y-6 pt-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4 text-primary" />
                    <span>The Mental Model</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-relaxed text-foreground/90">
                  <p>{pattern.intuition}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span>Interview Identification Signals</span>
                  </CardTitle>
                  <CardDescription>Look for these indicators in problem descriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {pattern.identificationRules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>Step-by-Step Execution Recipe</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                    {pattern.approachSteps.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">{step}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: Pseudocode */}
            <TabsContent value="pseudocode" className="pt-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Pseudocode Blueprint</CardTitle>
                    <CardDescription>Language-agnostic algorithmic framework</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyCode(pattern.pseudocode, "pseudo")}
                    className="gap-1 text-xs"
                  >
                    {copiedLang === "pseudo" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedLang === "pseudo" ? "Copied" : "Copy"}</span>
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="rounded-lg bg-muted/40 p-4 font-mono text-xs text-foreground/90 border border-border overflow-x-auto leading-relaxed">
                    <code>{pattern.pseudocode}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: Code Templates */}
            <TabsContent value="templates" className="pt-3">
              <Tabs defaultValue="python">
                <div className="flex items-center justify-between pb-3">
                  <TabsList>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="cpp">C++</TabsTrigger>
                    <TabsTrigger value="java">Java</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  </TabsList>
                </div>

                {(["python", "cpp", "java", "javascript"] as const).map((lang) => (
                  <TabsContent key={lang} value={lang}>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
                          {lang} Implementation
                        </CardTitle>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyCode(pattern.codeTemplates[lang], lang)}
                          className="gap-1 text-xs"
                        >
                          {copiedLang === lang ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copiedLang === lang ? "Copied" : "Copy"}</span>
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <pre className="rounded-lg bg-muted/40 p-4 font-mono text-xs text-foreground/90 border border-border overflow-x-auto leading-relaxed">
                          <code>{pattern.codeTemplates[lang]}</code>
                        </pre>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </TabsContent>
          </Tabs>

          {/* ATTACHED PROBLEMS LIST */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" />
                <span>Practice Problems Checklist</span>
              </CardTitle>
              <CardDescription>
                Reinforce this pattern by solving these canonical interview problems
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border/60">
              {problems.map((prob) => (
                <div key={prob.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {prob.title}
                      </span>
                      <Badge variant={prob.difficulty === "EASY" ? "easy" : "medium"}>
                        {prob.difficulty}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {prob.platform}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant={prob.status === "SOLVED" ? "default" : "outline"}
                      onClick={() => toggleProblemStatus(prob.id)}
                      className="text-xs gap-1.5 h-8"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{prob.status === "SOLVED" ? "Solved" : "Mark Solved"}</span>
                    </Button>
                    <a
                      href={prob.solveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Study Notes & Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Personal Study Notes</CardTitle>
              <CardDescription>Private notes saved to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {notes.map((note, i) => (
                  <div
                    key={i}
                    className="group relative rounded-lg border border-border/80 bg-muted/30 p-3 text-xs text-foreground/90 leading-relaxed"
                  >
                    <span>{note}</span>
                    <button
                      onClick={() => handleDeleteNote(i)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 space-y-2 border-t border-border">
                <Textarea
                  placeholder="Add a key observation or edge case note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="text-xs"
                  rows={3}
                />
                <Button size="sm" onClick={handleAddNote} className="w-full text-xs gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Save Note</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-primary">Need Spaced Repetition?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>
                Once you solve a problem under this pattern, our spaced repetition engine will automatically queue it for review today and in 3 days.
              </p>
              <Link href="/revision" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Go to Revision Queue
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
