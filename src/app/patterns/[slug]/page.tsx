"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CodeViewer } from "@/components/ui/code-viewer";
import { AuthGuard } from "@/components/auth/auth-guard";
import { FormattedText } from "@/components/ui/formatted-text";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BrainCircuit,
  Target,
  Code2,
  ExternalLink,
  CheckCircle2,
  PlusCircle,
  Trash2,
  Loader2,
  Sparkles,
  Zap,
  ListOrdered,
  ArrowRight,
  ChevronRight,
  BookCheck,
  StickyNote,
  FileText,
  X,
  Trophy,
  BarChart3,
  Check,
  ListChecks,
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
  coreIdea?: string;
  identificationSignals?: string;
  executionRecipe?: string;
  interviewRule?: string;
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

  // On-demand Drawers states
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isCoverageOpen, setIsCoverageOpen] = useState(false);

  // Reading & Study Progress States
  const [scrollProgress, setScrollProgress] = useState(0);
  const [studyStatus, setStudyStatus] = useState<string>("NOT_STARTED");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const hasAutoCompletedRef = useRef(false);

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

          const currentStatus = apiData.userProgress?.status || "NOT_STARTED";
          setStudyStatus(currentStatus);
          if (currentStatus === "COMPLETED" || currentStatus === "MASTERED") {
            hasAutoCompletedRef.current = true;
          }

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
            intuition: apiData.intuition || apiData.whatIsThis || "",
            coreIdea: apiData.coreIdea || "",
            identificationSignals: apiData.identificationSignals || "",
            executionRecipe: apiData.executionRecipe || "",
            interviewRule: apiData.interviewRule || "",
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
            status: currentStatus,
          };

          setPattern(mapped);
          setProblems(mappedProblems);

          // Fetch persisted personal notes for this pattern in background
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

  // Handle ESC key to close notes/coverage drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsNotesOpen(false);
        setIsCoverageOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Track page scroll and auto-update study progress when fully read/scrolled
  useEffect(() => {
    if (!pattern) return;

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) return;
      const currentScroll = window.scrollY;
      const progress = Math.min(100, Math.max(0, Math.round((currentScroll / totalScroll) * 100)));
      setScrollProgress(progress);

      // Auto-trigger completion when scrolled 75% or more
      if (progress >= 75 && !hasAutoCompletedRef.current && studyStatus !== "COMPLETED" && studyStatus !== "MASTERED") {
        hasAutoCompletedRef.current = true;
        updateStatus("COMPLETED", true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pattern, studyStatus]);

  const updateStatus = async (nextStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED", isAuto = false) => {
    if (!pattern) return;
    setIsUpdatingStatus(true);
    setStudyStatus(nextStatus);
    setPattern((prev) => (prev ? { ...prev, status: nextStatus } : null));

    if (nextStatus === "COMPLETED") {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4500);
    }

    try {
      await apiClient(`/progress/patterns/${pattern.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (err) {
      console.error("Failed to persist pattern study status", err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

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

  // Problem Coverage Computations
  const totalProblemsCount = problems.length;
  const solvedProblemsCount = problems.filter((p) => p.status === "SOLVED").length;
  const coveragePercentage = totalProblemsCount > 0 ? Math.round((solvedProblemsCount / totalProblemsCount) * 100) : 0;
  
  const easyProblems = problems.filter((p) => p.difficulty === "EASY");
  const easySolved = easyProblems.filter((p) => p.status === "SOLVED").length;

  const medProblems = problems.filter((p) => p.difficulty === "MEDIUM");
  const medSolved = medProblems.filter((p) => p.status === "SOLVED").length;

  const hardProblems = problems.filter((p) => p.difficulty === "HARD");
  const hardSolved = hardProblems.filter((p) => p.status === "SOLVED").length;

  const isStudied = studyStatus === "COMPLETED" || studyStatus === "MASTERED";

  return (
    <AuthGuard>
      {/* ── Fixed Reading Progress Bar at Top ── */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted/40 z-50 pointer-events-none">
        <div
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${isStudied ? 100 : scrollProgress}%` }}
        />
      </div>

      {/* ── Floating Study Toast on Auto Completion ── */}
      {showToast && (
        <div className="fixed bottom-6 right-20 z-50 max-w-sm rounded-2xl border border-primary/40 bg-card p-4 shadow-xl shadow-black/10 dark:shadow-black/40 backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <h4 className="text-sm font-bold text-foreground">Pattern Studied & Completed!</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You’ve finished reading <strong>{pattern?.name}</strong>. Your curriculum and topic progress have been updated!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Action Buttons (Fixed Bottom-Right) ── */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Floating Problem Coverage Button */}
        <button
          type="button"
          onClick={() => setIsCoverageOpen(true)}
          className="group relative flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white shadow-xl shadow-emerald-600/30 transition-all duration-200 cursor-pointer border border-emerald-300/40 hover:scale-110 active:scale-95"
          title="Problem Coverage in this pattern"
          aria-label="Open Problem Coverage in this pattern"
        >
          <Target className="h-5 w-5 transition-transform duration-200 group-hover:scale-110 text-white" strokeWidth={2.2} />
        </button>

        {/* Floating Note Symbol Trigger Button */}
        <button
          type="button"
          onClick={() => setIsNotesOpen(true)}
          className={cn(
            "group relative flex items-center justify-center h-12 w-12 rounded-full shadow-xl transition-all duration-200 cursor-pointer border hover:scale-110 active:scale-95",
            notes.length > 0
              ? "bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white border-amber-300/40 shadow-amber-500/30 ring-4 ring-amber-500/20"
              : "bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white border-amber-300/40 shadow-amber-500/30"
          )}
          title={`My Study Notes (${notes.length})`}
          aria-label="Open personal study notes"
        >
          <FileText className="h-5 w-5 transition-transform duration-200 group-hover:scale-110 text-white" strokeWidth={2.2} />
          {notes.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-extrabold px-1 border border-background shadow-xs">
              {notes.length}
            </span>
          )}
        </button>
      </div>

      {/* ── ON-DEMAND SLIDE-OVER: 1. PROBLEM COVERAGE DRAWER ── */}
      {isCoverageOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsCoverageOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500 font-bold">
                    <Target className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Problem Coverage in this pattern</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Pattern #{pattern?.number} • {pattern?.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCoverageOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  title="Close problem coverage (Esc)"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer Body: Render Dynamic Admin-authored Problem Coverage */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {pattern?.coreIdea && pattern.coreIdea.trim().length > 0 ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-emerald-500/20 bg-muted/15 p-4 sm:p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        <BrainCircuit className="h-4 w-4" />
                        <span>Problem Coverage Breakdown</span>
                      </div>
                      <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans prose prose-sm dark:prose-invert max-w-none">
                        <FormattedText content={pattern.coreIdea} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/80 bg-muted/10 p-8 text-center space-y-3 my-auto">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                      <Target className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-foreground">No Problem Coverage details added yet</h4>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                        Problem coverage information and question list added in the Admin section will appear here.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ON-DEMAND SLIDE-OVER: 2. NOTES DRAWER ── */}
      {isNotesOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsNotesOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500 font-bold">
                    <StickyNote className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">My Pattern Study Notes</h3>
                    <p className="text-[11px] text-muted-foreground">
                      {notes.length} note{notes.length === 1 ? "" : "s"} saved for {pattern?.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNotesOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  title="Close notes drawer (Esc)"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer Body: Notes List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
                {notes.length > 0 ? (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="group relative rounded-xl border border-border/80 bg-muted/30 hover:bg-muted/50 hover:border-amber-500/30 p-3.5 text-xs text-foreground/90 leading-relaxed pr-8 transition-all shadow-xs space-y-1.5"
                    >
                      <div className="flex items-start gap-2">
                        <StickyNote className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span className="font-sans text-xs flex-1 text-foreground whitespace-pre-wrap">
                          {note.content}
                        </span>
                      </div>
                      {note.createdAt && (
                        <div className="text-[10px] text-muted-foreground font-mono pl-5">
                          {new Date(note.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="absolute top-2.5 right-2.5 opacity-60 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive cursor-pointer p-1 rounded-md hover:bg-destructive/10"
                        aria-label="Delete note"
                        title="Delete note"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                      <StickyNote className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-foreground">No notes written yet</p>
                      <p className="text-[11px] text-muted-foreground max-w-[240px] mx-auto">
                        Jot down algorithmic observations, pointer invariants, and edge cases while studying.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer: Note Composer */}
              <div className="p-4 border-t border-border bg-muted/10 space-y-2.5">
                <Textarea
                  placeholder="Type an edge case, invariant, or interview trick... (Ctrl+Enter to save)"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleAddNote();
                    }
                  }}
                  className="text-xs resize-none bg-background focus:ring-amber-500/30"
                  rows={3}
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-muted-foreground hidden sm:inline">
                    Press <kbd className="font-mono bg-muted px-1 py-0.5 rounded text-[9px] border">Ctrl+Enter</kbd> to save
                  </span>
                  <Button
                    size="sm"
                    onClick={handleAddNote}
                    disabled={isSavingNote || !newNote.trim()}
                    className="text-xs gap-1.5 ml-auto cursor-pointer bg-amber-500 hover:bg-amber-600 text-amber-950 dark:text-black font-semibold"
                  >
                    {isSavingNote ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <PlusCircle className="h-3.5 w-3.5" />
                    )}
                    <span>{isSavingNote ? "Saving..." : "Save Note"}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Top Bar: Back link */}
        <div className="flex items-center justify-between gap-3">
          <Link href="/patterns" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Patterns</span>
          </Link>
        </div>

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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold font-mono">
                    #{pattern.number}
                  </span>
                  <Badge variant={pattern.difficulty === "EASY" ? "easy" : "medium"}>
                    {pattern.difficulty}
                  </Badge>
                  <span
                    className="text-xs text-amber-400 font-mono tracking-tighter"
                    title={`Importance: ${pattern.importance || 5}/5 stars`}
                  >
                    {"★".repeat(Math.max(1, Math.min(5, pattern.importance || 5)))}
                  </span>
                  <Badge variant="outline">Time: {pattern.complexity.time}</Badge>
                  <Badge variant="outline">Space: {pattern.complexity.space}</Badge>
                </div>

                {/* Right: Study Status Indicator & Controls */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Reading Tracker pill */}
                  <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border/80 bg-background/80 px-3 py-1.5 text-xs shadow-2xs">
                    {isStudied ? (
                      <div className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Studied (100%)</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-16">
                          <Progress value={scrollProgress} className="h-1.5" />
                        </div>
                        <span className="font-mono text-muted-foreground font-medium">
                          {scrollProgress}% Read
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Manual Mark / Unmark Studied Button */}
                  <Button
                    size="sm"
                    variant={isStudied ? "outline" : "default"}
                    onClick={() => updateStatus(isStudied ? "NOT_STARTED" : "COMPLETED")}
                    disabled={isUpdatingStatus}
                    className="text-xs gap-1.5 h-8 cursor-pointer"
                  >
                    {isUpdatingStatus ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isStudied ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <BookCheck className="h-3.5 w-3.5" />
                    )}
                    <span>{isStudied ? "Studied ✓" : "Mark Studied"}</span>
                  </Button>

                  <Link href={`/patterns?topic=${pattern.topicSlug}`}>
                    <Button variant="outline" size="sm" className="text-xs h-8">
                      Topic: {pattern.topicName}
                    </Button>
                  </Link>
                </div>
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
                    {/* 1. Mental Model & Core Intuition */}
                    <Card className="border-primary/20 bg-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-primary font-bold">
                          <BrainCircuit className="h-4.5 w-4.5" />
                          <span>1. Mental Model & Core Intuition</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {pattern.intuition ? (
                          <FormattedText content={pattern.intuition} />
                        ) : (
                          <p className="text-xs text-muted-foreground italic">Detailed mental model concept will be updated soon.</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* 2. Identification Signals */}
                    <Card className="border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-foreground font-bold">
                          <Target className="h-4.5 w-4.5 text-emerald-500" />
                          <span>2. Identification Signals</span>
                        </CardTitle>
                        <CardDescription>Look for these key indicators & triggers in problem statements</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {pattern.identificationSignals ? (
                          <FormattedText content={pattern.identificationSignals} />
                        ) : pattern.identificationRules.length > 0 ? (
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            {pattern.identificationRules.map((rule, idx) => (
                              <li key={idx} className="flex items-start gap-2.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{rule}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">Identification signals will be published soon.</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* 3. Execution Recipe */}
                    <Card className="border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-foreground font-bold">
                          <ListOrdered className="h-4.5 w-4.5 text-blue-500" />
                          <span>3. Execution Recipe</span>
                        </CardTitle>
                        <CardDescription>Step-by-step mental procedure to execute this pattern</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {pattern.executionRecipe ? (
                          <FormattedText content={pattern.executionRecipe} />
                        ) : (
                          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                            {pattern.approachSteps.map((step, idx) => (
                              <li key={idx} className="leading-relaxed">{step}</li>
                            ))}
                          </ol>
                        )}
                      </CardContent>
                    </Card>

                    {/* 4. Interview Identification Rule */}
                    <Card className="border-amber-500/20 bg-amber-500/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-foreground font-bold">
                          <Zap className="h-4.5 w-4.5 text-amber-500" />
                          <span>4. Interview Identification Rule</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {pattern.interviewRule ? (
                          <FormattedText content={pattern.interviewRule} className="text-foreground dark:text-amber-200/90 font-medium" />
                        ) : (
                          <p className="text-xs text-muted-foreground italic">Golden rule for quick recognition in tech interviews.</p>
                        )}
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

                {/* ATTACHED COVERAGE PROBLEMS CHECKLIST */}
                <Card className="border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="space-y-0.5">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Code2 className="h-4 w-4 text-primary" />
                          <span>Practice Problems Catalog</span>
                        </CardTitle>
                        <CardDescription>
                          Reinforce this pattern by solving these canonical interview problems
                        </CardDescription>
                      </div>
                      <Link href={`/problems?pattern=${pattern.slug}`}>
                        <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10 h-7 px-2.5">
                          <span>View in Catalog</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="divide-y divide-border/60">
                    {problems.length > 0 ? (
                      problems.map((prob) => (
                        <div key={prob.id} className="py-3 flex items-center justify-between gap-4">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                href={`/problems?pattern=${pattern.slug}&problem=${prob.id}`}
                                className="text-sm font-semibold text-foreground hover:text-primary hover:underline truncate inline-flex items-center gap-1 group"
                                title="Go to Problems page and view problem"
                              >
                                <span>{prob.title}</span>
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                              </Link>
                              <Badge variant={prob.difficulty === "EASY" ? "easy" : "medium"}>
                                {prob.difficulty}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground font-mono block">
                              {prob.platform}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant={prob.status === "SOLVED" ? "default" : "outline"}
                              onClick={() => toggleProblemStatus(prob.id)}
                              className={cn(
                                "text-xs gap-1.5 h-8 cursor-pointer transition-colors",
                                prob.status === "SOLVED"
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  : "hover:border-primary/50"
                              )}
                            >
                              {prob.status === "SOLVED" ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                              <span>{prob.status === "SOLVED" ? "Solved" : "Mark Solved"}</span>
                            </Button>
                            <a
                              href={prob.solveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg border border-border hover:bg-muted text-xs font-medium text-foreground transition-colors"
                              title="Solve directly on LeetCode"
                            >
                              <span>Solve</span>
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

              {/* Right 1 Col: Study Controls (Matching Image 2 + Problem Coverage Trigger) */}
              <div className="space-y-6">
                {/* Study Controls Card */}
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span>Study Controls</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Tools to accelerate your pattern retention
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {/* 1. Problem Coverage Button (Opens slide-over pop card on right) */}
                    <Button
                      variant="outline"
                      onClick={() => setIsCoverageOpen(true)}
                      className="w-full justify-between text-xs h-11 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer text-foreground group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Target className="h-4 w-4 text-emerald-500 transition-transform group-hover:scale-110" />
                        <span className="font-semibold">Problem Coverage in this pattern</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </Button>

                    {/* 2. Personal Study Notes Button (Opens slide-over drawer) */}
                    <Button
                      variant="outline"
                      onClick={() => setIsNotesOpen(true)}
                      className="w-full justify-between text-xs h-11 border-amber-500/30 hover:bg-amber-500/10 cursor-pointer text-foreground group"
                    >
                      <div className="flex items-center gap-2.5">
                        <StickyNote className="h-4 w-4 text-amber-500 transition-transform group-hover:rotate-6" />
                        <span className="font-semibold">Personal Study Notes</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-mono bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        {notes.length} note{notes.length === 1 ? "" : "s"}
                      </Badge>
                    </Button>

                    {/* 3. Studied Status Button */}
                    <Button
                      variant={isStudied ? "outline" : "default"}
                      onClick={() => updateStatus(isStudied ? "NOT_STARTED" : "COMPLETED")}
                      disabled={isUpdatingStatus}
                      className="w-full justify-between text-xs h-11 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <BookCheck className="h-4 w-4 text-primary" />
                        <span>Studied Status</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold">
                        {isStudied ? "Completed ✓" : `${scrollProgress}% read`}
                      </span>
                    </Button>
                  </CardContent>
                </Card>

                {/* Spaced Repetition Engine */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-primary flex items-center gap-1.5">
                      <Zap className="h-4 w-4" />
                      <span>Spaced Repetition</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-muted-foreground">
                    <p className="leading-relaxed">
                      Once you mark problems under this pattern as solved, our spaced repetition algorithm schedules active recall reviews at 1, 3, 7, and 14 days.
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
