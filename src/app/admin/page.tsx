"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { apiClient } from "@/lib/api-client";
import { MOCK_PATTERNS, MOCK_TOPICS, MOCK_ARTICLES, PatternData, ProblemData } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import {
  Shield,
  Layers,
  FileText,
  Users,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  LogOut,
  Lock,
  Loader2,
  AlertTriangle,
  X,
  ExternalLink,
  Code2,
  Sparkles,
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const { user, logout, isLoading: isAuthContextLoading } = useAuth();

  // Verification state: null = verifying, true = verified admin, false = denied
  const [isAdminVerified, setIsAdminVerified] = useState<boolean | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifiedAdminUser, setVerifiedAdminUser] = useState<any>(null);

  // Pattern and Problem States
  const [patterns, setPatterns] = useState<PatternData[]>(MOCK_PATTERNS);
  const [pendingArticles, setPendingArticles] = useState([
    {
      id: "art-sub-1",
      title: "Binary Tree Morris Traversal: Constant Space Magic",
      author: "David Kim",
      category: "DSA",
      submittedAt: "3 hours ago",
      excerpt: "How to traverse binary trees in O(1) extra auxiliary memory using threaded nodes.",
    },
    {
      id: "art-sub-2",
      title: "Monotonic Stack Patterns for Next Greater Element",
      author: "Priya Sharma",
      category: "DSA",
      submittedAt: "1 day ago",
      excerpt: "A comprehensive guide on maintaining stack invariants for histogram and range problems.",
    },
  ]);

  // Modal States
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);

  // New Pattern Form State
  const [newPatternTopicSlug, setNewPatternTopicSlug] = useState(MOCK_TOPICS[0].slug);
  const [newPatternName, setNewPatternName] = useState("");
  const [newPatternNumber, setNewPatternNumber] = useState(MOCK_PATTERNS.length + 1);
  const [newPatternDifficulty, setNewPatternDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [newPatternSummary, setNewPatternSummary] = useState("");
  const [newPatternTime, setNewPatternTime] = useState("O(N)");
  const [newPatternSpace, setNewPatternSpace] = useState("O(1)");
  const [newPatternIntuition, setNewPatternIntuition] = useState("");
  const [newPatternPseudocode, setNewPatternPseudocode] = useState("");
  const [isSubmittingPattern, setIsSubmittingPattern] = useState(false);

  // New Problem Form State
  const [newProblemPatternId, setNewProblemPatternId] = useState(MOCK_PATTERNS[0].id);
  const [newProblemTitle, setNewProblemTitle] = useState("");
  const [newProblemPlatform, setNewProblemPlatform] = useState("LeetCode");
  const [newProblemDifficulty, setNewProblemDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [newProblemUrl, setNewProblemUrl] = useState("");
  const [isSubmittingProblem, setIsSubmittingProblem] = useState(false);

  // Success Notification Banner
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // MANDATORY SECURITY VERIFICATION: Strictly verify token and role against backend API before granting panel access
  const verifyAdminAccess = async () => {
    setIsAdminVerified(null);
    setVerificationError(null);

    const token = typeof window !== "undefined" ? localStorage.getItem("patterniq_access_token") : null;

    if (!token) {
      setIsAdminVerified(false);
      setVerificationError("No active administrator session found. Please sign in to access the Admin Console.");
      return;
    }

    try {
      // Query server /auth/me with Bearer JWT to verify authentic admin identity and role
      const authRes = await apiClient<{ id: string; name: string; email: string; role: string }>("/auth/me");

      if (authRes.success && authRes.data) {
        if (authRes.data.role === "ADMIN") {
          setIsAdminVerified(true);
          setVerifiedAdminUser(authRes.data);
          return;
        } else {
          // Account exists but is not an administrator (e.g. STUDENT)
          setIsAdminVerified(false);
          setVerificationError(
            `Access Denied: Account '${authRes.data.email}' has role '${authRes.data.role}'. This console is restricted strictly to verified Administrators.`
          );
          return;
        }
      }

      setIsAdminVerified(false);
      setVerificationError(authRes.error?.message || "Administrator token verification failed. Please sign in again.");
    } catch (err: any) {
      setIsAdminVerified(false);
      setVerificationError(err?.message || "Failed to reach security authorization service to verify administrator role.");
    }
  };

  useEffect(() => {
    if (!isAuthContextLoading) {
      verifyAdminAccess();
    }
  }, [isAuthContextLoading]);

  // Handle Add Pattern Submit
  const handleCreatePattern = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatternName.trim()) return;
    setIsSubmittingPattern(true);

    const targetTopic = MOCK_TOPICS.find((t) => t.slug === newPatternTopicSlug) || MOCK_TOPICS[0];
    const slug = newPatternName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const createdPattern: PatternData = {
      id: `pat-${Date.now()}`,
      number: Number(newPatternNumber),
      name: newPatternName.trim(),
      slug,
      topicSlug: targetTopic.slug,
      topicName: targetTopic.name,
      difficulty: newPatternDifficulty,
      importance: 5,
      summary: newPatternSummary.trim() || "Algorithmic pattern implementation and logic.",
      intuition: newPatternIntuition.trim() || "Key mental model for solving this class of problems.",
      identificationRules: [
        "Recognize constraints and array/sequence properties.",
        "Monotonic condition or search space structure.",
      ],
      approachSteps: [
        "Set up pointer or state boundaries.",
        "Iterate and evaluate condition.",
        "Transition state or advance pointers.",
      ],
      complexity: {
        time: newPatternTime || "O(N)",
        space: newPatternSpace || "O(1)",
      },
      pseudocode:
        newPatternPseudocode.trim() ||
        `function solve(input):\n    // Step 1: Initialize pointers\n    left = 0, right = n - 1\n    return result`,
      codeTemplates: {
        python: `# Python Implementation\ndef solve(nums):\n    pass`,
        cpp: `// C++ Implementation\nvoid solve(vector<int>& nums) {}`,
        java: `// Java Implementation\nclass Solution {\n    public void solve(int[] nums) {}\n}`,
        javascript: `// JavaScript Implementation\nfunction solve(nums) {}`,
      },
      problems: [],
      status: "IN_PROGRESS",
    };

    try {
      // Call backend admin pattern creation API
      await apiClient("/admin/patterns", {
        method: "POST",
        body: JSON.stringify({
          topicId: targetTopic.id,
          number: Number(newPatternNumber),
          name: newPatternName.trim(),
          shortDescription: newPatternSummary.trim(),
          difficulty: newPatternDifficulty,
          timeComplexity: newPatternTime,
          spaceComplexity: newPatternSpace,
          pseudocode: newPatternPseudocode.trim(),
        }),
      }).catch(() => {});

      // Add to local state
      setPatterns((prev) => [createdPattern, ...prev]);
      setShowPatternModal(false);
      setSuccessBanner(`Pattern "${newPatternName}" added successfully to ${targetTopic.name}!`);
      setTimeout(() => setSuccessBanner(null), 4000);

      // Reset form
      setNewPatternName("");
      setNewPatternSummary("");
      setNewPatternIntuition("");
      setNewPatternPseudocode("");
      setNewPatternNumber((n) => Number(n) + 1);
    } finally {
      setIsSubmittingPattern(false);
    }
  };

  // Handle Add Problem Submit
  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProblemTitle.trim() || !newProblemUrl.trim()) return;
    setIsSubmittingProblem(true);

    const problemSlug = newProblemTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const createdProblem: ProblemData = {
      id: `prob-${Date.now()}`,
      title: newProblemTitle.trim(),
      slug: problemSlug,
      difficulty: newProblemDifficulty,
      platform: newProblemPlatform.trim() || "LeetCode",
      solveUrl: newProblemUrl.trim(),
      orderIndex: 1,
      status: "NOT_ATTEMPTED",
    };

    try {
      // Call backend admin problem creation API
      await apiClient("/admin/problems", {
        method: "POST",
        body: JSON.stringify({
          title: newProblemTitle.trim(),
          platform: newProblemPlatform.trim(),
          solveUrl: newProblemUrl.trim(),
          difficulty: newProblemDifficulty,
        }),
      }).catch(() => {});

      // Attach problem directly to selected pattern in local state
      setPatterns((prev) =>
        prev.map((pat) => {
          if (pat.id === newProblemPatternId) {
            return {
              ...pat,
              problems: [...pat.problems, createdProblem],
            };
          }
          return pat;
        })
      );

      setShowProblemModal(false);
      setSuccessBanner(`Problem "${newProblemTitle}" added and linked to pattern!`);
      setTimeout(() => setSuccessBanner(null), 4000);

      // Reset form
      setNewProblemTitle("");
      setNewProblemUrl("");
    } finally {
      setIsSubmittingProblem(false);
    }
  };

  const handleApprove = (id: string) => {
    setPendingArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const handleReject = (id: string) => {
    setPendingArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSwitchAccount = async () => {
    await logout();
    router.push("/admin/signin");
  };

  // 1. LOADING / VERIFYING STATE SCREEN
  if (isAdminVerified === null || isAuthContextLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="rounded-2xl border border-border/80 bg-card p-8 max-w-sm w-full text-center space-y-4 shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary animate-pulse">
            <Shield className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">Verifying Administrator Access</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Validating cryptographic security token and administrative permissions...
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Checking authorization policy</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. ACCESS DENIED / NOT A VALID ADMIN SCREEN
  if (isAdminVerified === false) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <Card className="border-border/80 shadow-2xl overflow-hidden bg-card text-center">
            <div className="h-1.5 w-full bg-destructive" />

            <CardHeader className="space-y-3 pb-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-xs">
                <Lock className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <Badge variant="outline" className="border-destructive/30 text-destructive gap-1 text-[11px] font-mono">
                  <AlertTriangle className="h-3 w-3" /> ACCESS RESTRICTED
                </Badge>
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                  Valid Administrator Required
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
                  Access to the PatternIQ Admin Console is strictly guarded. Only authenticated users with verified <strong>ADMIN</strong> roles may enter.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {verificationError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive text-left leading-relaxed">
                  {verificationError}
                </div>
              )}

              {user && (
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-left space-y-1 text-xs">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Current Active Identity
                  </span>
                  <p className="font-semibold text-foreground">{user.name}</p>
                  <p className="text-muted-foreground font-mono">{user.email}</p>
                  <Badge variant="secondary" className="text-[10px] mt-1 font-mono">
                    Assigned Role: {user.role}
                  </Badge>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <Link href="/admin/signin" className="block w-full">
                  <Button className="w-full text-xs font-semibold h-10 gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Sign In to Admin Portal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>

                <Link href="/admin/signup" className="block w-full">
                  <Button variant="outline" className="w-full text-xs h-10 gap-1.5">
                    <span>Enroll as Administrator</span>
                  </Button>
                </Link>

                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSwitchAccount}
                    className="w-full text-xs text-muted-foreground hover:text-foreground"
                  >
                    <span>Log Out Current User</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 3. AUTHORIZED ADMIN CONSOLE
  const currentAdmin = verifiedAdminUser || user;
  const allProblems = patterns.flatMap((p) =>
    p.problems.map((prob) => ({ ...prob, patternName: p.name, patternSlug: p.slug }))
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Administration</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage curriculum patterns, attached problems, and moderate community technical articles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/patterns">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              <Layers className="h-3.5 w-3.5" />
              <span>View Live Catalog</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSwitchAccount}
            className="gap-1 text-xs text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION */}
      {successBanner && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)}>
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      )}

      {/* OVERVIEW STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Patterns</p>
            <p className="text-2xl font-bold font-mono text-foreground">{patterns.length}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Layers className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Catalog Problems</p>
            <p className="text-2xl font-bold font-mono text-foreground">{allProblems.length}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <FileText className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Curriculum Tracks</p>
            <p className="text-2xl font-bold font-mono text-foreground">{MOCK_TOPICS.length}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <TrendingUp className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Articles</p>
            <p className="text-2xl font-bold font-mono text-amber-500">{pendingArticles.length}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Users className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* ADMIN TABS: Patterns, Problems, Moderation */}
      <Tabs defaultValue="patterns" className="w-full">
        <TabsList className="grid grid-cols-3 max-w-lg">
          <TabsTrigger value="patterns">Patterns ({patterns.length})</TabsTrigger>
          <TabsTrigger value="problems">Problems ({allProblems.length})</TabsTrigger>
          <TabsTrigger value="moderation">Articles ({pendingArticles.length})</TabsTrigger>
        </TabsList>

        {/* TAB 1: PATTERNS INVENTORY & ADD PATTERN */}
        <TabsContent value="patterns" className="pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Curriculum Pattern Inventory</h2>
              <p className="text-xs text-muted-foreground">
                Manage algorithm patterns or publish new patterns to student curriculum tracks.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowPatternModal(true)}
              className="gap-1.5 text-xs h-9 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Pattern</span>
            </Button>
          </div>

          <Card>
            <div className="divide-y divide-border/60">
              {patterns.map((pat) => (
                <div
                  key={pat.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold font-mono shrink-0">
                      #{pat.number}
                    </span>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate text-foreground">{pat.name}</span>
                        <Badge variant={pat.difficulty === "EASY" ? "easy" : "medium"}>
                          {pat.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-[11px] font-mono">
                          {pat.complexity.time}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground block truncate">
                        Track: {pat.topicName} • {pat.problems.length} Practice Problems
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/patterns/${pat.slug}`}>
                      <Button size="sm" variant="outline" className="text-xs h-7 px-2.5">
                        <span>Preview</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* TAB 2: PROBLEMS INVENTORY & ADD PROBLEM */}
        <TabsContent value="problems" className="pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Catalog Problems Management</h2>
              <p className="text-xs text-muted-foreground">
                Add canonical coding interview questions and attach them to target patterns.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowProblemModal(true)}
              className="gap-1.5 text-xs h-9 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Problem</span>
            </Button>
          </div>

          <Card>
            <div className="divide-y divide-border/60">
              {allProblems.map((prob) => (
                <div
                  key={prob.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{prob.title}</span>
                      <Badge variant={prob.difficulty === "EASY" ? "easy" : "medium"}>
                        {prob.difficulty}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground">
                        {prob.platform}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Attached Pattern: <strong className="text-foreground">{prob.patternName}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={prob.solveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline h-7 px-2"
                    >
                      <span>View on LeetCode</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* TAB 3: ARTICLE MODERATION */}
        <TabsContent value="moderation" className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Community Submissions Queue</h2>
              <p className="text-xs text-muted-foreground">
                Review and approve technical deep-dive guides contributed by students and engineers.
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              {pendingArticles.length} Pending
            </Badge>
          </div>

          <div className="space-y-3">
            {pendingArticles.length > 0 ? (
              pendingArticles.map((art) => (
                <Card key={art.id} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {art.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">
                          Submitted {art.submittedAt} by {art.author}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-foreground">{art.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {art.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(art.id)}
                        className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Approve & Publish</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(art.id)}
                        className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center text-sm text-muted-foreground border-dashed">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-foreground">Moderation queue is clean!</p>
                <p className="text-xs mt-1">All community technical articles have been reviewed.</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW PATTERN */}
      {/* ========================================================================= */}
      {showPatternModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Layers className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Add New Algorithmic Pattern</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPatternModal(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePattern} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Curriculum Track</label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground"
                    value={newPatternTopicSlug}
                    onChange={(e) => setNewPatternTopicSlug(e.target.value)}
                  >
                    {MOCK_TOPICS.map((t) => (
                      <option key={t.id} value={t.slug}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Pattern Number</label>
                  <Input
                    type="number"
                    required
                    value={newPatternNumber}
                    onChange={(e) => setNewPatternNumber(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Difficulty</label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground"
                    value={newPatternDifficulty}
                    onChange={(e) => setNewPatternDifficulty(e.target.value as any)}
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Pattern Name</label>
                <Input
                  placeholder="e.g. Monotonic Stack: Next Greater Element"
                  required
                  value={newPatternName}
                  onChange={(e) => setNewPatternName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Short Summary</label>
                <Input
                  placeholder="Maintain monotonic element invariant to answer nearest boundary queries in O(1) amortized."
                  value={newPatternSummary}
                  onChange={(e) => setNewPatternSummary(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Time Complexity</label>
                  <Input
                    placeholder="O(N)"
                    value={newPatternTime}
                    onChange={(e) => setNewPatternTime(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Space Complexity</label>
                  <Input
                    placeholder="O(N)"
                    value={newPatternSpace}
                    onChange={(e) => setNewPatternSpace(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">The Mental Model / Intuition</label>
                <Textarea
                  placeholder="Explain why this technique works conceptually..."
                  rows={2}
                  value={newPatternIntuition}
                  onChange={(e) => setNewPatternIntuition(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Pseudocode Blueprint</label>
                <Textarea
                  placeholder="function monotonicStack(nums): ..."
                  rows={4}
                  className="font-mono text-xs"
                  value={newPatternPseudocode}
                  onChange={(e) => setNewPatternPseudocode(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPatternModal(false)}
                  disabled={isSubmittingPattern}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmittingPattern} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isSubmittingPattern ? "Creating..." : "Publish Pattern"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD NEW PROBLEM */}
      {/* ========================================================================= */}
      {showProblemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <FileText className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Add New Practice Problem</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowProblemModal(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProblem} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Attach to Pattern</label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground"
                  value={newProblemPatternId}
                  onChange={(e) => setNewProblemPatternId(e.target.value)}
                >
                  {patterns.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.number} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Problem Title</label>
                <Input
                  placeholder="e.g. Daily Temperatures"
                  required
                  value={newProblemTitle}
                  onChange={(e) => setNewProblemTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Platform / Identifier</label>
                  <Input
                    placeholder="LeetCode #739"
                    required
                    value={newProblemPlatform}
                    onChange={(e) => setNewProblemPlatform(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Difficulty</label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground"
                    value={newProblemDifficulty}
                    onChange={(e) => setNewProblemDifficulty(e.target.value as any)}
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Problem URL</label>
                <Input
                  type="url"
                  placeholder="https://leetcode.com/problems/daily-temperatures/"
                  required
                  value={newProblemUrl}
                  onChange={(e) => setNewProblemUrl(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProblemModal(false)}
                  disabled={isSubmittingProblem}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmittingProblem} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isSubmittingProblem ? "Adding..." : "Add Problem"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
