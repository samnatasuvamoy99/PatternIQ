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
import { CodeViewer } from "@/components/ui/code-viewer";
import { apiClient } from "@/lib/api-client";
import { MOCK_PATTERNS, MOCK_TOPICS, MOCK_ARTICLES, PatternData, ProblemData, TopicData } from "@/lib/mock-data";
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
  BookOpen,
  Target,
  Maximize2,
  Zap,
  GitBranch,
  Star,
  Globe,
  Terminal,
  Copy,
  FolderPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TOPIC_ICON_OPTIONS = [
  { name: "Target (Pointers / Search)", icon: Target, value: "Target" },
  { name: "Maximize (Windows / Subarrays)", icon: Maximize2, value: "Maximize2" },
  { name: "Zap (Speed / Cycles)", icon: Zap, value: "Zap" },
  { name: "GitBranch (Trees / Graphs)", icon: GitBranch, value: "GitBranch" },
  { name: "Layers (Dynamic Programming)", icon: Layers, value: "Layers" },
  { name: "BookOpen (Curriculum)", icon: BookOpen, value: "BookOpen" },
  { name: "Code2 (Data Structures)", icon: Code2, value: "Code2" },
];

export default function AdminPage() {
  const router = useRouter();
  const { user, logout, isLoading: isAuthContextLoading } = useAuth();

  // Verification state: null = verifying, true = verified admin, false = denied
  const [isAdminVerified, setIsAdminVerified] = useState<boolean | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifiedAdminUser, setVerifiedAdminUser] = useState<any>(null);

  // Curriculum Data States
  const [topics, setTopics] = useState<TopicData[]>(MOCK_TOPICS);
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

  // Modal Open States
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);

  // Active Tab inside Pattern Modal: "meta" | "intuition" | "code"
  const [patternModalTab, setPatternModalTab] = useState<"meta" | "intuition" | "code">("meta");
  const [templateLangTab, setTemplateLangTab] = useState<"python" | "cpp" | "java" | "javascript">("python");

  // Success Notification Banner
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // -------------------------------------------------------------
  // FORM STATES: 1. NEW TOPIC (Prisma Topic Model)
  // -------------------------------------------------------------
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicDescription, setNewTopicDescription] = useState("");
  const [newTopicIcon, setNewTopicIcon] = useState("Target");
  const [newTopicOrder, setNewTopicOrder] = useState(MOCK_TOPICS.length + 1);
  const [newTopicPublished, setNewTopicPublished] = useState(true);
  const [isSubmittingTopic, setIsSubmittingTopic] = useState(false);

  // -------------------------------------------------------------
  // FORM STATES: 2. NEW PATTERN (Prisma Pattern Model)
  // -------------------------------------------------------------
  const [newPatternTopicName, setNewPatternTopicName] = useState("");
  const [newPatternNumber, setNewPatternNumber] = useState(MOCK_PATTERNS.length + 1);
  const [newPatternName, setNewPatternName] = useState("");
  const [newPatternDifficulty, setNewPatternDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [newPatternImportance, setNewPatternImportance] = useState(5);
  const [newPatternShortDesc, setNewPatternShortDesc] = useState("");
  const [newPatternWhatIsThis, setNewPatternWhatIsThis] = useState("");
  const [newPatternIntuition, setNewPatternIntuition] = useState("");
  const [newPatternCoreIdea, setNewPatternCoreIdea] = useState("");
  const [newPatternInterviewRule, setNewPatternInterviewRule] = useState("");
  const [newPatternTime, setNewPatternTime] = useState("O(N)");
  const [newPatternSpace, setNewPatternSpace] = useState("O(1)");
  const [newPatternPseudocode, setNewPatternPseudocode] = useState(
    `function solve(arr):\n    left = 0, right = arr.length - 1\n    while left < right:\n        if condition:\n            return [left, right]\n        else:\n            left++\n    return [-1, -1]`
  );
  const [newPatternPy, setNewPatternPy] = useState(
    `def solve(nums: list[int]) -> list[int]:\n    left, right = 0, len(nums) - 1\n    while left < right:\n        if nums[left] + nums[right] == target:\n            return [left, right]\n        left += 1\n    return []`
  );
  const [newPatternCpp, setNewPatternCpp] = useState(
    `vector<int> solve(vector<int>& nums) {\n    int left = 0, right = nums.size() - 1;\n    while (left < right) {\n        // implementation\n    }\n    return {};\n}`
  );
  const [newPatternJava, setNewPatternJava] = useState(
    `public int[] solve(int[] nums) {\n    int left = 0, right = nums.length - 1;\n    while (left < right) {\n        // implementation\n    }\n    return new int[]{};\n}`
  );
  const [newPatternJs, setNewPatternJs] = useState(
    `function solve(nums) {\n    let left = 0, right = nums.length - 1;\n    while (left < right) {\n        // implementation\n    }\n    return [];\n}`
  );
  const [isSubmittingPattern, setIsSubmittingPattern] = useState(false);

  // -------------------------------------------------------------
  // FORM STATES: 3. NEW PROBLEM (Prisma Problem Model)
  // -------------------------------------------------------------
  const [newProblemPatternId, setNewProblemPatternId] = useState(MOCK_PATTERNS[0].id);
  const [newProblemTitle, setNewProblemTitle] = useState("");
  const [newProblemPlatform, setNewProblemPlatform] = useState("LeetCode");
  const [newProblemExternalId, setNewProblemExternalId] = useState("");
  const [newProblemDifficulty, setNewProblemDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [newProblemUrl, setNewProblemUrl] = useState("");
  const [newProblemIsCore, setNewProblemIsCore] = useState(true);
  const [isSubmittingProblem, setIsSubmittingProblem] = useState(false);

  // -------------------------------------------------------------
  // MANDATORY SECURITY VERIFICATION: Backend API Check
  // -------------------------------------------------------------
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
      const authRes = await apiClient<{ id: string; name: string; email: string; role: string }>("/auth/me");

      if (authRes.success && authRes.data) {
        if (authRes.data.role === "ADMIN") {
          setIsAdminVerified(true);
          setVerifiedAdminUser(authRes.data);
          return;
        } else {
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

  // -------------------------------------------------------------
  // HANDLERS: 1. CREATE TOPIC
  // -------------------------------------------------------------
  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    setIsSubmittingTopic(true);

    const slug = newTopicName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const newTopic: TopicData = {
      id: `topic-${Date.now()}`,
      name: newTopicName.trim(),
      slug,
      description: newTopicDescription.trim() || "Algorithmic patterns track.",
      patternCount: 0,
      completedCount: 0,
      order: Number(newTopicOrder),
      icon: newTopicIcon,
    };

    try {
      await apiClient("/admin/topics", {
        method: "POST",
        body: JSON.stringify({
          name: newTopicName.trim(),
          description: newTopicDescription.trim(),
          icon: newTopicIcon,
          order: Number(newTopicOrder),
          published: newTopicPublished,
        }),
      }).catch(() => {});

      setTopics((prev) => [...prev, newTopic]);
      setShowTopicModal(false);
      setSuccessBanner(`Topic "${newTopicName}" successfully created!`);
      setTimeout(() => setSuccessBanner(null), 4000);

      // Reset
      setNewTopicName("");
      setNewTopicDescription("");
      setNewTopicOrder((o) => Number(o) + 1);
    } finally {
      setIsSubmittingTopic(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: 2. CREATE PATTERN
  // -------------------------------------------------------------
  const handleCreatePattern = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatternName.trim()) return;
    setIsSubmittingPattern(true);

    const topicNameClean = newPatternTopicName.trim() || "General Patterns";
    const topicSlug = topicNameClean
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let targetTopic = topics.find(
      (t) => t.name.toLowerCase() === topicNameClean.toLowerCase() || t.slug === topicSlug
    );

    if (!targetTopic) {
      targetTopic = {
        id: `topic-${Date.now()}`,
        name: topicNameClean,
        slug: topicSlug,
        description: `Curriculum track for ${topicNameClean}`,
        patternCount: 1,
        completedCount: 0,
        order: topics.length + 1,
        icon: "Layers",
      };
      setTopics((prev) => [...prev, targetTopic!]);
      await apiClient("/admin/topics", {
        method: "POST",
        body: JSON.stringify({
          name: topicNameClean,
          description: `Curriculum track for ${topicNameClean}`,
          icon: "Layers",
          order: topics.length + 1,
          published: true,
        }),
      }).catch(() => {});
    }

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
      importance: newPatternImportance,
      summary: newPatternShortDesc.trim() || "Algorithmic pattern implementation.",
      intuition: newPatternIntuition.trim() || "Mental model and visual technique.",
      identificationRules: newPatternInterviewRule
        ? [newPatternInterviewRule.trim()]
        : ["Problem involves ordered sequence or pair searching."],
      approachSteps: [
        "Initialize pointer boundaries and invariants.",
        "Iterate and evaluate condition.",
        "Transition pointers or update optimal state.",
      ],
      complexity: {
        time: newPatternTime || "O(N)",
        space: newPatternSpace || "O(1)",
      },
      pseudocode: newPatternPseudocode.trim(),
      codeTemplates: {
        python: newPatternPy.trim(),
        cpp: newPatternCpp.trim(),
        java: newPatternJava.trim(),
        javascript: newPatternJs.trim(),
      },
      problems: [],
      status: "IN_PROGRESS",
    };

    try {
      await apiClient("/admin/patterns", {
        method: "POST",
        body: JSON.stringify({
          topicId: targetTopic.id,
          number: Number(newPatternNumber),
          name: newPatternName.trim(),
          shortDescription: newPatternShortDesc.trim(),
          whatIsThis: newPatternWhatIsThis.trim(),
          intuition: newPatternIntuition.trim(),
          coreIdea: newPatternCoreIdea.trim(),
          interviewRule: newPatternInterviewRule.trim(),
          difficulty: newPatternDifficulty,
          importance: Number(newPatternImportance),
          timeComplexity: newPatternTime,
          spaceComplexity: newPatternSpace,
          pseudocode: newPatternPseudocode.trim(),
          cppTemplate: newPatternCpp.trim(),
          javaTemplate: newPatternJava.trim(),
          jsTemplate: newPatternJs.trim(),
        }),
      }).catch(() => {});

      setPatterns((prev) => [createdPattern, ...prev]);
      setShowPatternModal(false);
      setSuccessBanner(`Pattern "${newPatternName}" published to ${targetTopic.name}!`);
      setTimeout(() => setSuccessBanner(null), 4000);

      // Reset
      setNewPatternName("");
      setNewPatternShortDesc("");
      setNewPatternIntuition("");
      setNewPatternCoreIdea("");
      setNewPatternInterviewRule("");
      setNewPatternNumber((n) => Number(n) + 1);
    } finally {
      setIsSubmittingPattern(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: 3. CREATE PROBLEM
  // -------------------------------------------------------------
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
      await apiClient("/admin/problems", {
        method: "POST",
        body: JSON.stringify({
          title: newProblemTitle.trim(),
          platform: newProblemPlatform.trim(),
          externalId: newProblemExternalId.trim() || undefined,
          solveUrl: newProblemUrl.trim(),
          difficulty: newProblemDifficulty,
        }),
      }).catch(() => {});

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
      setSuccessBanner(`Problem "${newProblemTitle}" added and attached!`);
      setTimeout(() => setSuccessBanner(null), 4000);

      setNewProblemTitle("");
      setNewProblemUrl("");
      setNewProblemExternalId("");
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
    if (window.confirm("Are you sure you want to sign out of the Admin panel?")) {
      await logout();
      router.push("/admin/signin");
    }
  };

  // 1. LOADING / VERIFYING STATE
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

  // 2. ACCESS DENIED SCREEN
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
    p.problems.map((prob) => ({ ...prob, patternName: p.name, patternSlug: p.slug, topicName: p.topicName }))
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Platform Administration</h1>
          <p className="text-sm text-muted-foreground">
            Manage curriculum tracks, patterns, canonical practice problems, and content governance.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowTopicModal(true)}
            className="gap-1.5 text-xs h-9 cursor-pointer"
          >
            <FolderPlus className="h-3.5 w-3.5 text-primary" />
            <span>+ New Topic</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setShowPatternModal(true)}
            className="gap-1.5 text-xs h-9 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ New Pattern</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowProblemModal(true)}
            className="gap-1.5 text-xs h-9 cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 text-emerald-500" />
            <span>+ New Problem</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSwitchAccount}
            className="gap-1 text-xs text-muted-foreground hover:text-destructive h-9"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      {/* SUCCESS BANNER */}
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
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Curriculum Tracks</p>
            <p className="text-2xl font-bold font-mono text-foreground">{topics.length}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <TrendingUp className="h-5 w-5" />
          </div>
        </Card>

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
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Articles</p>
            <p className="text-2xl font-bold font-mono text-amber-500">{pendingArticles.length}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Users className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* ADMIN TABS: Topics, Patterns, Problems, Moderation */}
      <Tabs defaultValue="patterns" className="w-full">
        <TabsList className="grid grid-cols-4 max-w-xl">
          <TabsTrigger value="topics">Topics ({topics.length})</TabsTrigger>
          <TabsTrigger value="patterns">Patterns ({patterns.length})</TabsTrigger>
          <TabsTrigger value="problems">Problems ({allProblems.length})</TabsTrigger>
          <TabsTrigger value="moderation">Articles ({pendingArticles.length})</TabsTrigger>
        </TabsList>

        {/* TAB 1: TOPICS INVENTORY */}
        <TabsContent value="topics" className="pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Curriculum Topics</h2>
              <p className="text-xs text-muted-foreground">
                High-level subject areas (e.g. Array Patterns, Sliding Window, Dynamic Programming).
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowTopicModal(true)}
              className="gap-1.5 text-xs h-9 cursor-pointer"
            >
              <FolderPlus className="h-4 w-4" />
              <span>Create New Topic</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((t) => {
              const trackPatterns = patterns.filter((p) => p.topicSlug === t.slug);
              return (
                <Card key={t.id} className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      Track #{t.order}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {trackPatterns.length} Patterns
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{t.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {t.description}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-mono">slug: {t.slug}</span>
                    <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                      PUBLISHED
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB 2: PATTERNS INVENTORY */}
        <TabsContent value="patterns" className="pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Pattern Inventory</h2>
              <p className="text-xs text-muted-foreground">
                Algorithmic problem-solving patterns complete with mental models, complexity, and templates.
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm truncate text-foreground">{pat.name}</span>
                        <Badge variant={pat.difficulty === "EASY" ? "easy" : "medium"}>
                          {pat.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-[11px] font-mono">
                          {pat.complexity.time}
                        </Badge>
                        <span className="text-xs text-amber-400 font-mono">
                          {"★".repeat(pat.importance || 5)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground block truncate">
                        Track: {pat.topicName} • {pat.problems.length} Practice Problems Attached
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/patterns/${pat.slug}`}>
                      <Button size="sm" variant="outline" className="text-xs h-7 px-2.5">
                        <span>Preview Pattern</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* TAB 3: PROBLEMS INVENTORY */}
        <TabsContent value="problems" className="pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Practice Problems Inventory</h2>
              <p className="text-xs text-muted-foreground">
                Canonical LeetCode and platform problems attached to curriculum patterns.
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">{prob.title}</span>
                      <Badge variant={prob.difficulty === "EASY" ? "easy" : "medium"}>
                        {prob.difficulty}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground">
                        {prob.platform}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Track: <strong className="text-foreground">{prob.topicName}</strong> &bull; Pattern:{" "}
                      <strong className="text-foreground">{prob.patternName}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={prob.solveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline h-7 px-2"
                    >
                      <span>Open Problem</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* TAB 4: ARTICLE MODERATION */}
        <TabsContent value="moderation" className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Community Submissions Queue</h2>
              <p className="text-xs text-muted-foreground">
                Review and approve technical deep-dive guides contributed by community members.
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
      {/* 1. MODERN MODAL: ADD NEW TOPIC */}
      {/* ========================================================================= */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 font-bold">
                  <FolderPlus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Create Curriculum Track / Topic</h2>
                  <p className="text-xs text-muted-foreground">Adds a top-level subject grouping to the database</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTopicModal(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Topic Name</label>
                <Input
                  placeholder="e.g. Monotonic Stack & Queue"
                  required
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Description</label>
                <Textarea
                  placeholder="Techniques for maintaining order invariants and boundary queries in linear time."
                  rows={3}
                  value={newTopicDescription}
                  onChange={(e) => setNewTopicDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Track Icon</label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground"
                    value={newTopicIcon}
                    onChange={(e) => setNewTopicIcon(e.target.value)}
                  >
                    {TOPIC_ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Curriculum Order</label>
                  <Input
                    type="number"
                    required
                    value={newTopicOrder}
                    onChange={(e) => setNewTopicOrder(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="topicPublished"
                  checked={newTopicPublished}
                  onChange={(e) => setNewTopicPublished(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="topicPublished" className="font-medium text-foreground cursor-pointer">
                  Publish immediately (Visible in student learning tracks)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTopicModal(false)}
                  disabled={isSubmittingTopic}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmittingTopic} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isSubmittingTopic ? "Creating..." : "Save Topic"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODERN STUDIO MODAL: ADD NEW PATTERN (DB Schema Complete) */}
      {/* ========================================================================= */}
      {showPatternModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl rounded-2xl border border-border bg-card shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Pattern Creation Studio</h2>
                  <p className="text-xs text-muted-foreground">
                    Define mental models, complexities, pseudocode, and multi-language templates
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPatternModal(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-border bg-muted/10 text-xs">
              <button
                type="button"
                onClick={() => setPatternModalTab("meta")}
                className={cn(
                  "pb-2.5 px-3 font-semibold transition-all border-b-2 cursor-pointer",
                  patternModalTab === "meta"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                1. Core Metadata & Scope
              </button>
              <button
                type="button"
                onClick={() => setPatternModalTab("intuition")}
                className={cn(
                  "pb-2.5 px-3 font-semibold transition-all border-b-2 cursor-pointer",
                  patternModalTab === "intuition"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                2. Mental Model & Rules
              </button>
              <button
                type="button"
                onClick={() => setPatternModalTab("code")}
                className={cn(
                  "pb-2.5 px-3 font-semibold transition-all border-b-2 cursor-pointer",
                  patternModalTab === "code"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                3. Code Studio & Pseudocode
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreatePattern} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* TAB 1: METADATA */}
              {patternModalTab === "meta" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Topic Name</label>
                      <Input
                        placeholder="e.g. Two Pointers, Graphs, DP"
                        required
                        value={newPatternTopicName}
                        onChange={(e) => setNewPatternTopicName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Sequential Number</label>
                      <Input
                        type="number"
                        required
                        value={newPatternNumber}
                        onChange={(e) => setNewPatternNumber(Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Difficulty Level</label>
                      <div className="grid grid-cols-3 gap-1">
                        {(["EASY", "MEDIUM", "HARD"] as const).map((diff) => (
                          <button
                            key={diff}
                            type="button"
                            onClick={() => setNewPatternDifficulty(diff)}
                            className={cn(
                              "h-9 rounded-md border text-xs font-semibold transition-all cursor-pointer",
                              newPatternDifficulty === diff
                                ? diff === "EASY"
                                  ? "bg-emerald-500/20 text-emerald-500 border-emerald-500"
                                  : diff === "MEDIUM"
                                  ? "bg-amber-500/20 text-amber-500 border-amber-500"
                                  : "bg-rose-500/20 text-rose-500 border-rose-500"
                                : "border-border text-muted-foreground hover:bg-muted"
                            )}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Pattern Name</label>
                    <Input
                      placeholder="e.g. Fast & Slow Pointers: Cycle Finding"
                      required
                      value={newPatternName}
                      onChange={(e) => setNewPatternName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Short Summary (Display on Cards)</label>
                    <Input
                      placeholder="Move two pointers at different speeds to detect cycles and midpoints in O(1) space."
                      value={newPatternShortDesc}
                      onChange={(e) => setNewPatternShortDesc(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Time Complexity</label>
                      <Input
                        placeholder="O(N)"
                        value={newPatternTime}
                        onChange={(e) => setNewPatternTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Space Complexity</label>
                      <Input
                        placeholder="O(1)"
                        value={newPatternSpace}
                        onChange={(e) => setNewPatternSpace(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Importance (1 - 5 Stars)</label>
                      <div className="flex items-center gap-1 h-9 px-3 rounded-md border border-input bg-background">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewPatternImportance(star)}
                            className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className={cn(
                                "h-4 w-4",
                                star <= newPatternImportance ? "fill-current text-amber-400" : "text-muted-foreground/30"
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: INTUITION & RULES */}
              {patternModalTab === "intuition" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span>The Mental Model (Intuition)</span>
                    </label>
                    <Textarea
                      placeholder="Explain the underlying visual intuition. Why does this eliminate brute-force computation?"
                      rows={3}
                      value={newPatternIntuition}
                      onChange={(e) => setNewPatternIntuition(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Core Algorithmic Idea</label>
                    <Textarea
                      placeholder="Key state invariants to maintain during loop execution..."
                      rows={2}
                      value={newPatternCoreIdea}
                      onChange={(e) => setNewPatternCoreIdea(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Interview Identification Signal (When to recognize this)</span>
                    </label>
                    <Input
                      placeholder="e.g. Sorted array + 'Find pairs matching target sum' -> Two pointers"
                      value={newPatternInterviewRule}
                      onChange={(e) => setNewPatternInterviewRule(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: CODE STUDIO */}
              {patternModalTab === "code" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Pseudocode Editor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-foreground flex items-center gap-1.5">
                        <Terminal className="h-4 w-4 text-primary" />
                        <span>Language-Agnostic Pseudocode</span>
                      </label>
                      <span className="text-[11px] text-muted-foreground font-mono">pseudocode.algo</span>
                    </div>
                    <div className="rounded-xl border border-[#30363d] bg-[#0d1117] p-3 shadow-inner">
                      <Textarea
                        rows={5}
                        className="font-mono text-xs text-[#c9d1d9] bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 leading-relaxed resize-y"
                        value={newPatternPseudocode}
                        onChange={(e) => setNewPatternPseudocode(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Multi-Language Code Templates */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-foreground flex items-center gap-1.5">
                        <Code2 className="h-4 w-4 text-primary" />
                        <span>Production Code Templates</span>
                      </label>
                      <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg">
                        {(["python", "cpp", "java", "javascript"] as const).map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => setTemplateLangTab(lang)}
                            className={cn(
                              "px-2.5 py-1 rounded-md text-[11px] font-mono uppercase font-semibold transition-colors cursor-pointer",
                              templateLangTab === lang
                                ? "bg-card text-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#30363d] bg-[#0d1117] p-4 shadow-inner">
                      {templateLangTab === "python" && (
                        <Textarea
                          rows={6}
                          className="font-mono text-xs text-[#c9d1d9] bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 leading-relaxed resize-y"
                          value={newPatternPy}
                          onChange={(e) => setNewPatternPy(e.target.value)}
                        />
                      )}
                      {templateLangTab === "cpp" && (
                        <Textarea
                          rows={6}
                          className="font-mono text-xs text-[#c9d1d9] bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 leading-relaxed resize-y"
                          value={newPatternCpp}
                          onChange={(e) => setNewPatternCpp(e.target.value)}
                        />
                      )}
                      {templateLangTab === "java" && (
                        <Textarea
                          rows={6}
                          className="font-mono text-xs text-[#c9d1d9] bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 leading-relaxed resize-y"
                          value={newPatternJava}
                          onChange={(e) => setNewPatternJava(e.target.value)}
                        />
                      )}
                      {templateLangTab === "javascript" && (
                        <Textarea
                          rows={6}
                          className="font-mono text-xs text-[#c9d1d9] bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 leading-relaxed resize-y"
                          value={newPatternJs}
                          onChange={(e) => setNewPatternJs(e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  {patternModalTab !== "meta" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPatternModalTab(patternModalTab === "code" ? "intuition" : "meta")}
                    >
                      &larr; Previous Step
                    </Button>
                  )}
                  {patternModalTab !== "code" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPatternModalTab(patternModalTab === "meta" ? "intuition" : "code")}
                    >
                      Next Step &rarr;
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
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
                    <span>{isSubmittingPattern ? "Publishing..." : "Publish Pattern"}</span>
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODERN MODAL: ADD NEW PROBLEM (DB Schema Complete) */}
      {/* ========================================================================= */}
      {showProblemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 font-bold">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Add Practice Question</h2>
                  <p className="text-xs text-muted-foreground">Attach a canonical LeetCode problem to a pattern</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProblemModal(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProblem} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Attach to Pattern</label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground font-medium"
                  value={newProblemPatternId}
                  onChange={(e) => setNewProblemPatternId(e.target.value)}
                >
                  {patterns.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.number} - {p.name} ({p.topicName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Problem Title</label>
                <Input
                  placeholder="e.g. Next Greater Element I"
                  required
                  value={newProblemTitle}
                  onChange={(e) => setNewProblemTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Platform / Identifier</label>
                  <Input
                    placeholder="LeetCode #496"
                    required
                    value={newProblemPlatform}
                    onChange={(e) => setNewProblemPlatform(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">External Problem ID</label>
                  <Input
                    placeholder="496"
                    value={newProblemExternalId}
                    onChange={(e) => setNewProblemExternalId(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Difficulty Rating</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["EASY", "MEDIUM", "HARD"] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setNewProblemDifficulty(diff)}
                      className={cn(
                        "h-8 rounded-md border text-xs font-semibold transition-all cursor-pointer",
                        newProblemDifficulty === diff
                          ? diff === "EASY"
                            ? "bg-emerald-500/20 text-emerald-500 border-emerald-500"
                            : diff === "MEDIUM"
                            ? "bg-amber-500/20 text-amber-500 border-amber-500"
                            : "bg-rose-500/20 text-rose-500 border-rose-500"
                          : "border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Official Problem URL</label>
                <Input
                  type="url"
                  placeholder="https://leetcode.com/problems/next-greater-element-i/"
                  required
                  value={newProblemUrl}
                  onChange={(e) => setNewProblemUrl(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="problemIsCore"
                  checked={newProblemIsCore}
                  onChange={(e) => setNewProblemIsCore(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="problemIsCore" className="font-medium text-foreground cursor-pointer">
                  Mark as Core Essential Problem (Recommended first solve)
                </label>
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
                  <span>{isSubmittingProblem ? "Linking..." : "Attach Problem"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
