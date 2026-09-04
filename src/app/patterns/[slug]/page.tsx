"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CodeViewer } from "@/components/ui/code-viewer";
import { AuthGuard } from "@/components/auth/auth-guard";
import { apiClient } from "@/lib/api-client";
import {
  ArrowLeft,
  BrainCircuit,
  Target,
  Code2,
  ExternalLink,
  CheckCircle2,
  BookOpen,
  PlusCircle,
  Trash2,
  Loader2,
} from "lucide-react";

interface ProblemData {
  id: string;
  title: string;
  slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  platform: string;
  solveUrl: string;
  orderIndex: number;
  status?: "NOT_ATTEMPTED" | "ATTEMPTED" | "SOLVED";
}

interface PatternData {
  id: string;
  number: number;
  name: string;
  slug: string;
  topicSlug: string;
  topicName: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  importance: number;
  summary: string;
  intuition: string;
  identificationRules: string[];
  approachSteps: string[];
  complexity: {
    time: string;
    space: string;
  };
  pseudocode: string;
  codeTemplates: {
    cpp: string;
    java: string;
    python: string;
    javascript: string;
  };
  problems: ProblemData[];
  status?: string;
}

interface PatternNote {
  id: string;
  content: string;
  createdAt?: string;
}

export default function PatternDetailPage({ params }: { params: { slug: string } }) {
  const [pattern, setPattern] = useState<PatternData | null>(null);
  const [problems, setProblems] = useState<ProblemData[]>([]);
  const [notes, setNotes] = useState<PatternNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Fetch live pattern from API
  useEffect(() => {
    async function loadPattern() {
      setIsLoading(true);
      try {
        const res = await apiClient<any>(`/patterns/${params.slug}`);
        if (res.success && res.data) {
          const apiData = res.data;

          const rules: string[] = [];
          if (Array.isArray(apiData.useCases) && apiData.useCases.length > 0) {
            apiData.useCases.forEach((u: any) => {
              if (u.content && !u.isWhenNotToUse) rules.push(u.content);
            });
          }
          if (rules.length === 0 && apiData.interviewRule) {
            rules.push(apiData.interviewRule);
          }

          const warnings: string[] = [];
          if (Array.isArray(apiData.warnings) && apiData.warnings.length > 0) {
            apiData.warnings.forEach((w: any) => {
              if (w.content) warnings.push(w.content);
            });
          }

          const mappedProblems: ProblemData[] = (apiData.problems || []).map((pItem: any, idx: number) => {
            const prob = pItem.problem || pItem;
            return {
              id: prob.id || `prob-${idx}`,
              title: prob.title || "Practice Problem",
              slug: prob.slug || "problem",
              difficulty: prob.difficulty || "MEDIUM",
              platform: prob.platform || "LeetCode",
              solveUrl: prob.solveUrl || prob.url || "https://leetcode.com",
              orderIndex: pItem.order || idx + 1,
              status: prob.status || "NOT_ATTEMPTED",
            };
          });

          const mapped: PatternData = {
            id: apiData.id,
            number: apiData.number || 1,
            name: apiData.name,
            slug: apiData.slug,
            topicSlug: apiData.topic?.slug || "general",
            topicName: apiData.topic?.name || "General Patterns",
            difficulty: apiData.difficulty || "MEDIUM",
            importance: apiData.importance || 5,
            summary: apiData.shortDescription || apiData.whatIsThis || "",
            intuition: apiData.intuition || apiData.coreIdea || apiData.whatIsThis || "",
            identificationRules: rules,
            approachSteps: warnings.length > 0 ? warnings : [
              "Identify the problem constraints and boundary conditions.",
              "Initialize pointers / data structures appropriate for the pattern.",
              "Iterate through the collection while maintaining required invariants.",
              "Return the evaluated result or optimal value.",
            ],
            complexity: {
              time: apiData.timeComplexity || "O(N)",
              space: apiData.spaceComplexity || "O(1)",
            },
            pseudocode: apiData.pseudocode || "// Pseudocode will be published soon",
            codeTemplates: {
              cpp: apiData.cppTemplate || "// C++ implementation coming soon",
              java: apiData.javaTemplate || "// Java implementation coming soon",
              python: apiData.pyTemplate || "# Python implementation coming soon",
              javascript: apiData.jsTemplate || "// JavaScript implementation coming soon",
            },
            problems: mappedProblems,
            status: apiData.userProgress?.status || "NOT_STARTED",
          };

          setPattern(mapped);
          setProblems(mappedProblems);

          // Fetch persisted personal notes for this pattern
          apiClient<PatternNote[]>(`/notes?patternId=${apiData.id}`).then((notesRes) => {
            if (notesRes.success && Array.isArray(notesRes.data)) {
              setNotes(notesRes.data);
            }
          }).catch(() => {});
        } else {
          setPattern(null);
        }
      } catch (e) {
        console.error("Failed to load pattern from API", e);
        setPattern(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadPattern();
  }, [params.slug]);

  const toggleProblemStatus = async (problemId: string) => {
    let nextStatus: "SOLVED" | "ATTEMPTED" = "SOLVED";
    setProblems((prev) =>
      prev.map((prob) => {
        if (prob.id === problemId) {
          nextStatus = prob.status === "SOLVED" ? "ATTEMPTED" : "SOLVED";
          return { ...prob, status: nextStatus };
        }
        return prob;
      })
    );

    // Call progress API to persist in DB
    apiClient("/progress/problems/toggle", {
      method: "POST",
      body: JSON.stringify({
        problemId,
        status: nextStatus,
      }),
    }).catch(() => {});
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !pattern) return;
    const content = newNote.trim();
    setIsSavingNote(true);
    try {
      const res = await apiClient<PatternNote>("/notes", {
        method: "POST",
        body: JSON.stringify({
          content,
          patternId: pattern.id,
        }),
      });
      if (res.success && res.data) {
        setNotes((prev) => [res.data!, ...prev]);
        setNewNote("");
      }
    } catch (err) {
      console.error("Failed to save note", err);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    try {
      await apiClient(`/notes/${noteId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete note", err);
    }
  };

  return (
    <AuthGuard>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Back link */}
        <Link href="/patterns" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Patterns</span>
        </Link>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading pattern details...</p>
          </div>
        ) : !pattern ? (
          <Card className="p-12 text-center space-y-4 border-dashed">
            <h2 className="text-xl font-semibold">Pattern not found</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              The requested pattern could not be retrieved from the database.
            </p>
            <div className="pt-2">
              <Link href="/patterns">
                <Button variant="outline">Browse All Patterns</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <>
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
              {pattern.summary && (
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
                  {pattern.summary}
                </p>
              )}
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
                        <p>{pattern.intuition || "Detailed intuition notes will be published soon."}</p>
                      </CardContent>
                    </Card>

                    {pattern.identificationRules.length > 0 && (
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
                    )}

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
                  <TabsContent value="pseudocode" className="pt-3 space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <div>
                        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                          <Code2 className="h-4 w-4 text-primary" />
                          <span>Pseudocode Blueprint</span>
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Language-agnostic logic flow with step-by-step pointers and syntax highlighting
                        </p>
                      </div>
                    </div>

                    <CodeViewer
                      code={pattern.pseudocode}
                      language="pseudocode"
                      title={`${pattern.slug}.algo`}
                    />
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

                      {(["python", "cpp", "java", "javascript"] as const).map((lang) => {
                        const extension = lang === "cpp" ? "cpp" : lang === "python" ? "py" : lang === "java" ? "java" : "js";
                        return (
                          <TabsContent key={lang} value={lang}>
                            <CodeViewer
                              code={pattern.codeTemplates[lang]}
                              language={lang}
                              title={`${pattern.slug}.${extension}`}
                            />
                          </TabsContent>
                        );
                      })}
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
                    {problems.length > 0 ? (
                      problems.map((prob) => (
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
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        No practice problems attached to this pattern yet.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right 1 Col: Study Notes & Summary */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Personal Study Notes</CardTitle>
                    <CardDescription>Private notes saved during your study session</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      {notes.length > 0 ? (
                        notes.map((note) => (
                          <div
                            key={note.id}
                            className="group relative rounded-lg border border-border/80 bg-muted/30 p-3 text-xs text-foreground/90 leading-relaxed pr-7"
                          >
                            <span>{note.content}</span>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive cursor-pointer"
                              aria-label="Delete note"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic py-1">
                          No notes saved yet for this pattern.
                        </p>
                      )}
                    </div>

                    <div className="pt-2 space-y-2 border-t border-border">
                      <Textarea
                        placeholder="Add a key observation or edge case note..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="text-xs"
                        rows={3}
                      />
                      <Button
                        size="sm"
                        onClick={handleAddNote}
                        disabled={isSavingNote || !newNote.trim()}
                        className="w-full text-xs gap-1 cursor-pointer"
                      >
                        {isSavingNote ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <PlusCircle className="h-3.5 w-3.5" />
                        )}
                        <span>{isSavingNote ? "Saving..." : "Save Note"}</span>
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
                      Once you solve a problem under this pattern, our spaced repetition engine will automatically queue it for review.
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
          </>
        )}
      </div>
    </AuthGuard>
  );
}
