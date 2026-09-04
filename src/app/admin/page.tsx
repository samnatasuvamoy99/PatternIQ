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
  BookOpen,
  Target,
  Maximize2,
  Zap,
  GitBranch,
  FolderPlus,
  Edit2,
  Trash2,
  MessageSquare,
  RefreshCw,
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

interface TopicItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  order: number;
  published: boolean;
  _count?: { patterns: number };
}

interface PatternItem {
  id: string;
  number: number;
  name: string;
  slug: string;
  topicId: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  importance: number;
  shortDescription?: string | null;
  whatIsThis?: string | null;
  intuition?: string | null;
  coreIdea?: string | null;
  interviewRule?: string | null;
  timeComplexity?: string | null;
  spaceComplexity?: string | null;
  pseudocode?: string | null;
  cppTemplate?: string | null;
  javaTemplate?: string | null;
  jsTemplate?: string | null;
  topic?: { id: string; name: string; slug: string };
  _count?: { problems: number };
}

interface ProblemItem {
  id: string;
  title: string;
  slug: string;
  platform?: string | null;
  externalId?: string | null;
  solveUrl: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  patterns?: Array<{ pattern: { id: string; name: string; slug: string } }>;
}

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  category: string;
  status: string;
  publishedAt?: string | null;
  author?: { id: string; name: string };
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, logout, isLoading: isAuthContextLoading } = useAuth();

  // Verification state: null = verifying, true = verified admin, false = denied
  const [isAdminVerified, setIsAdminVerified] = useState<boolean | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifiedAdminUser, setVerifiedAdminUser] = useState<any>(null);

  // Live Curriculum & Management Data States
  const [dashboardTotals, setDashboardTotals] = useState({
    users: 0,
    patterns: 0,
    problems: 0,
    publishedArticles: 0,
    pendingArticles: 0,
    comments: 0,
  });

  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [patterns, setPatterns] = useState<PatternItem[]>([]);
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [pendingArticles, setPendingArticles] = useState<ArticleItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Success / Error Banner
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Modals Open States (Create)
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);

  // Modals Open States (Edit)
  const [editingTopic, setEditingTopic] = useState<TopicItem | null>(null);
  const [editingPattern, setEditingPattern] = useState<PatternItem | null>(null);
  const [editingProblem, setEditingProblem] = useState<ProblemItem | null>(null);

  // Active Tab inside Pattern Modals: "meta" | "intuition" | "code"
  const [patternModalTab, setPatternModalTab] = useState<"meta" | "intuition" | "code">("meta");
  const [templateLangTab, setTemplateLangTab] = useState<"python" | "cpp" | "java" | "javascript">("python");

  // Deletion Confirmation Modal State
  const [itemToDelete, setItemToDelete] = useState<{
    type: "topic" | "pattern" | "problem" | "article";
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // -------------------------------------------------------------
  // FORM STATES: 1. NEW TOPIC
  // -------------------------------------------------------------
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicDescription, setNewTopicDescription] = useState("");
  const [newTopicIcon, setNewTopicIcon] = useState("Target");
  const [newTopicOrder, setNewTopicOrder] = useState(1);
  const [newTopicPublished, setNewTopicPublished] = useState(true);
  const [isSubmittingTopic, setIsSubmittingTopic] = useState(false);

  // -------------------------------------------------------------
  // FORM STATES: 2. NEW PATTERN
  // -------------------------------------------------------------
  const [newPatternTopicId, setNewPatternTopicId] = useState("");
  const [newPatternNumber, setNewPatternNumber] = useState(1);
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
  // FORM STATES: 3. NEW PROBLEM
  // -------------------------------------------------------------
  const [newProblemPatternId, setNewProblemPatternId] = useState("");
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
          loadAllAdminData();
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
  // FETCH ALL LIVE ADMIN DATA
  // -------------------------------------------------------------
  const loadAllAdminData = async () => {
    setIsLoadingData(true);
    try {
      const [dashRes, topicsRes, patternsRes, problemsRes, articlesRes] = await Promise.all([
        apiClient<any>("/admin/dashboard"),
        apiClient<TopicItem[]>("/admin/topics"),
        apiClient<PatternItem[]>("/admin/patterns"),
        apiClient<ProblemItem[]>("/admin/problems"),
        apiClient<ArticleItem[]>("/admin/articles?status=SUBMITTED"),
      ]);

      if (dashRes.success && dashRes.data?.totals) {
        setDashboardTotals(dashRes.data.totals);
      }

      if (topicsRes.success && Array.isArray(topicsRes.data)) {
        setTopics(topicsRes.data);
        if (topicsRes.data.length > 0 && !newPatternTopicId) {
          setNewPatternTopicId(topicsRes.data[0].id);
        }
      }

      if (patternsRes.success && Array.isArray(patternsRes.data)) {
        setPatterns(patternsRes.data);
        if (patternsRes.data.length > 0 && !newProblemPatternId) {
          setNewProblemPatternId(patternsRes.data[0].id);
        }
      }

      if (problemsRes.success && Array.isArray(problemsRes.data)) {
        setProblems(problemsRes.data);
      }

      if (articlesRes.success && Array.isArray(articlesRes.data)) {
        setPendingArticles(articlesRes.data);
      }
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setErrorBanner(null);
    setTimeout(() => setSuccessBanner(null), 4500);
  };

  const showError = (msg: string) => {
    setErrorBanner(msg);
    setSuccessBanner(null);
    setTimeout(() => setErrorBanner(null), 5000);
  };

  // -------------------------------------------------------------
  // HANDLERS: 1. CREATE TOPIC
  // -------------------------------------------------------------
  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    setIsSubmittingTopic(true);

    try {
      const res = await apiClient<TopicItem>("/admin/topics", {
        method: "POST",
        body: JSON.stringify({
          name: newTopicName.trim(),
          description: newTopicDescription.trim() || undefined,
          icon: newTopicIcon,
          order: Number(newTopicOrder),
          published: newTopicPublished,
        }),
      });

      if (res.success && res.data) {
        setTopics((prev) => [...prev, res.data!]);
        setShowTopicModal(false);
        showSuccess(`Topic "${newTopicName}" successfully created!`);
        setNewTopicName("");
        setNewTopicDescription("");
        setNewTopicOrder((o) => Number(o) + 1);
        loadAllAdminData();
      } else {
        showError(res.error?.message || "Failed to create topic");
      }
    } catch (e: any) {
      showError(e?.message || "Failed to create topic");
    } finally {
      setIsSubmittingTopic(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: 2. UPDATE TOPIC
  // -------------------------------------------------------------
  const handleUpdateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic || !editingTopic.name.trim()) return;
    setIsSubmittingTopic(true);

    try {
      const res = await apiClient<TopicItem>(`/admin/topics/${editingTopic.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editingTopic.name.trim(),
          description: editingTopic.description?.trim() || undefined,
          icon: editingTopic.icon || undefined,
          order: Number(editingTopic.order),
          published: editingTopic.published,
        }),
      });

      if (res.success && res.data) {
        setTopics((prev) => prev.map((t) => (t.id === editingTopic.id ? res.data! : t)));
        setEditingTopic(null);
        showSuccess(`Topic "${editingTopic.name}" successfully updated!`);
      } else {
        showError(res.error?.message || "Failed to update topic");
      }
    } catch (e: any) {
      showError(e?.message || "Failed to update topic");
    } finally {
      setIsSubmittingTopic(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: 3. CREATE PATTERN
  // -------------------------------------------------------------
  const handleCreatePattern = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatternName.trim() || !newPatternTopicId) return;
    setIsSubmittingPattern(true);

    try {
      const res = await apiClient<PatternItem>("/admin/patterns", {
        method: "POST",
        body: JSON.stringify({
          topicId: newPatternTopicId,
          number: Number(newPatternNumber),
          name: newPatternName.trim(),
          shortDescription: newPatternShortDesc.trim() || undefined,
          whatIsThis: newPatternWhatIsThis.trim() || undefined,
          intuition: newPatternIntuition.trim() || undefined,
          coreIdea: newPatternCoreIdea.trim() || undefined,
          interviewRule: newPatternInterviewRule.trim() || undefined,
          difficulty: newPatternDifficulty,
          importance: Number(newPatternImportance),
          timeComplexity: newPatternTime,
          spaceComplexity: newPatternSpace,
          pseudocode: newPatternPseudocode.trim() || undefined,
          cppTemplate: newPatternCpp.trim() || undefined,
          javaTemplate: newPatternJava.trim() || undefined,
          jsTemplate: newPatternJs.trim() || undefined,
          pyTemplate: newPatternPy.trim() || undefined,
        }),
      });

      if (res.success && res.data) {
        setPatterns((prev) => [res.data!, ...prev]);
        setShowPatternModal(false);
        showSuccess(`Pattern "${newPatternName}" successfully created!`);
        setNewPatternName("");
        setNewPatternShortDesc("");
        setNewPatternIntuition("");
        setNewPatternCoreIdea("");
        setNewPatternInterviewRule("");
        setNewPatternNumber((n) => Number(n) + 1);
        loadAllAdminData();
      } else {
        showError(res.error?.message || "Failed to create pattern");
      }
    } catch (e: any) {
      showError(e?.message || "Failed to create pattern");
    } finally {
      setIsSubmittingPattern(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: 4. UPDATE PATTERN
  // -------------------------------------------------------------
  const handleUpdatePattern = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPattern || !editingPattern.name.trim()) return;
    setIsSubmittingPattern(true);

    try {
      const res = await apiClient<PatternItem>(`/admin/patterns/${editingPattern.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          topicId: editingPattern.topicId,
          number: Number(editingPattern.number),
          name: editingPattern.name.trim(),
          shortDescription: editingPattern.shortDescription?.trim() || undefined,
          whatIsThis: editingPattern.whatIsThis?.trim() || undefined,
          intuition: editingPattern.intuition?.trim() || undefined,
          coreIdea: editingPattern.coreIdea?.trim() || undefined,
          interviewRule: editingPattern.interviewRule?.trim() || undefined,
          difficulty: editingPattern.difficulty,
          importance: Number(editingPattern.importance),
          timeComplexity: editingPattern.timeComplexity || undefined,
          spaceComplexity: editingPattern.spaceComplexity || undefined,
          pseudocode: editingPattern.pseudocode?.trim() || undefined,
          cppTemplate: editingPattern.cppTemplate?.trim() || undefined,
          javaTemplate: editingPattern.javaTemplate?.trim() || undefined,
          jsTemplate: editingPattern.jsTemplate?.trim() || undefined,
        }),
      });

      if (res.success && res.data) {
        setPatterns((prev) => prev.map((p) => (p.id === editingPattern.id ? { ...p, ...res.data! } : p)));
        setEditingPattern(null);
        showSuccess(`Pattern "${editingPattern.name}" successfully updated!`);
      } else {
        showError(res.error?.message || "Failed to update pattern");
      }
    } catch (e: any) {
      showError(e?.message || "Failed to update pattern");
    } finally {
      setIsSubmittingPattern(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: 5. CREATE PROBLEM
  // -------------------------------------------------------------
  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProblemTitle.trim() || !newProblemUrl.trim()) return;
    setIsSubmittingProblem(true);

    try {
      const res = await apiClient<ProblemItem>("/admin/problems", {
        method: "POST",
        body: JSON.stringify({
          title: newProblemTitle.trim(),
          platform: newProblemPlatform.trim(),
          externalId: newProblemExternalId.trim() || undefined,
          solveUrl: newProblemUrl.trim(),
          difficulty: newProblemDifficulty,
        }),
      });

      if (res.success && res.data) {
        const createdProb = res.data;

        // If a pattern was selected, attach it
        if (newProblemPatternId) {
          await apiClient(`/admin/patterns/${newProblemPatternId}/problems`, {
            method: "POST",
            body: JSON.stringify({
              problemId: createdProb.id,
              isCore: newProblemIsCore,
            }),
          }).catch(() => {});
        }

        setShowProblemModal(false);
        showSuccess(`Problem "${newProblemTitle}" created and attached!`);
        setNewProblemTitle("");
        setNewProblemUrl("");
        setNewProblemExternalId("");
        loadAllAdminData();
      } else {
        showError(res.error?.message || "Failed to create problem");
      }
    } catch (e: any) {
      showError(e?.message || "Failed to create problem");
    } finally {
      setIsSubmittingProblem(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: 6. UPDATE PROBLEM
  // -------------------------------------------------------------
  const handleUpdateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProblem || !editingProblem.title.trim()) return;
    setIsSubmittingProblem(true);

    try {
      const res = await apiClient<ProblemItem>(`/admin/problems/${editingProblem.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editingProblem.title.trim(),
          platform: editingProblem.platform?.trim() || undefined,
          externalId: editingProblem.externalId?.trim() || undefined,
          solveUrl: editingProblem.solveUrl.trim(),
          difficulty: editingProblem.difficulty,
        }),
      });

      if (res.success && res.data) {
        setProblems((prev) => prev.map((p) => (p.id === editingProblem.id ? { ...p, ...res.data! } : p)));
        setEditingProblem(null);
        showSuccess(`Problem "${editingProblem.title}" successfully updated!`);
      } else {
        showError(res.error?.message || "Failed to update problem");
      }
    } catch (e: any) {
      showError(e?.message || "Failed to update problem");
    } finally {
      setIsSubmittingProblem(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: 7. DELETE ANY ITEM (Topic, Pattern, Problem, Article)
  // -------------------------------------------------------------
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      let endpoint = "";
      if (itemToDelete.type === "topic") endpoint = `/admin/topics/${itemToDelete.id}`;
      else if (itemToDelete.type === "pattern") endpoint = `/admin/patterns/${itemToDelete.id}`;
      else if (itemToDelete.type === "problem") endpoint = `/admin/problems/${itemToDelete.id}`;
      else if (itemToDelete.type === "article") endpoint = `/admin/articles/${itemToDelete.id}`;

      const res = await apiClient(endpoint, { method: "DELETE" });

      if (res.success) {
        if (itemToDelete.type === "topic") {
          setTopics((prev) => prev.filter((t) => t.id !== itemToDelete.id));
        } else if (itemToDelete.type === "pattern") {
          setPatterns((prev) => prev.filter((p) => p.id !== itemToDelete.id));
        } else if (itemToDelete.type === "problem") {
          setProblems((prev) => prev.filter((p) => p.id !== itemToDelete.id));
        } else if (itemToDelete.type === "article") {
          setPendingArticles((prev) => prev.filter((a) => a.id !== itemToDelete.id));
        }

        showSuccess(`${itemToDelete.type.toUpperCase()} "${itemToDelete.name}" deleted.`);
        setItemToDelete(null);
        loadAllAdminData();
      } else {
        showError(res.error?.message || `Failed to delete ${itemToDelete.type}`);
      }
    } catch (e: any) {
      showError(e?.message || `Failed to delete ${itemToDelete.type}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // -------------------------------------------------------------
  // ARTICLE ACTIONS: Approve & Reject
  // -------------------------------------------------------------
  const handleApproveArticle = async (id: string) => {
    try {
      const res = await apiClient(`/admin/articles/${id}/publish`, { method: "POST" });
      if (res.success) {
        setPendingArticles((prev) => prev.filter((a) => a.id !== id));
        showSuccess("Article approved and published to community!");
        loadAllAdminData();
      } else {
        showError(res.error?.message || "Failed to approve article");
      }
    } catch (e: any) {
      showError(e?.message || "Failed to approve article");
    }
  };

  const handleRejectArticle = async (id: string) => {
    try {
      const res = await apiClient(`/admin/articles/${id}/reject`, { method: "POST" });
      if (res.success) {
        setPendingArticles((prev) => prev.filter((a) => a.id !== id));
        showSuccess("Article rejected.");
        loadAllAdminData();
      } else {
        showError(res.error?.message || "Failed to reject article");
      }
    } catch (e: any) {
      showError(e?.message || "Failed to reject article");
    }
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
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Shield className="h-7 w-7 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold">Verifying Administrator Privileges</h2>
          <p className="text-xs text-muted-foreground">Checking session authorization against security gateway...</p>
          <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  // 2. DENIED / UNAUTHORIZED STATE
  if (isAdminVerified === false) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="rounded-2xl border border-destructive/40 bg-card p-8 max-w-md w-full text-center space-y-5 shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Restricted Administrative Area</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {verificationError || "You must be signed in with an account having verified Administrator role to view this page."}
          </p>
          <div className="space-y-2 pt-2">
            <Link href="/admin/signin" className="block w-full">
              <Button className="w-full text-xs font-semibold h-10 gap-1.5 cursor-pointer">
                <Shield className="h-3.5 w-3.5" />
                <span>Sign In to Admin Portal</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Platform Administration</h1>
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
              Live DB
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage curriculum tracks, patterns, canonical practice problems, and content governance in real time.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={loadAllAdminData}
            disabled={isLoadingData}
            className="gap-1.5 text-xs h-9 cursor-pointer"
            title="Refresh live data"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoadingData && "animate-spin")} />
            <span>Refresh</span>
          </Button>

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
            className="gap-1 text-xs text-muted-foreground hover:text-destructive h-9 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      {/* NOTIFICATION BANNERS */}
      {successBanner && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="cursor-pointer">
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      )}

      {errorBanner && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-xs font-semibold text-destructive flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{errorBanner}</span>
          </div>
          <button onClick={() => setErrorBanner(null)} className="cursor-pointer">
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      )}

      {/* OVERVIEW STATS ROW (FROM LIVE DASHBOARD API) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Registered Users</p>
            <p className="text-2xl font-bold font-mono text-foreground">{dashboardTotals.users}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Users className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Patterns</p>
            <p className="text-2xl font-bold font-mono text-foreground">{dashboardTotals.patterns}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Layers className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Problems</p>
            <p className="text-2xl font-bold font-mono text-foreground">{dashboardTotals.problems}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <FileText className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Articles</p>
            <p className="text-2xl font-bold font-mono text-amber-500">{dashboardTotals.pendingArticles}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <MessageSquare className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* ADMIN TABS: Topics, Patterns, Problems, Moderation */}
      <Tabs defaultValue="patterns" className="w-full">
        <TabsList className="grid grid-cols-4 max-w-xl">
          <TabsTrigger value="topics">Topics ({topics.length})</TabsTrigger>
          <TabsTrigger value="patterns">Patterns ({patterns.length})</TabsTrigger>
          <TabsTrigger value="problems">Problems ({problems.length})</TabsTrigger>
          <TabsTrigger value="moderation">Articles ({pendingArticles.length})</TabsTrigger>
        </TabsList>

        {/* ============================================================== */}
        {/* TAB 1: TOPICS INVENTORY */}
        {/* ============================================================== */}
        <TabsContent value="topics" className="pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Curriculum Topics ({topics.length})</h2>
              <p className="text-xs text-muted-foreground">
                High-level tracks (e.g. Array Patterns, Sliding Window, Dynamic Programming).
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
            {topics.length > 0 ? (
              topics.map((t) => (
                <Card key={t.id} className="p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        Order #{t.order}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="text-xs">
                          {t._count?.patterns ?? 0} Patterns
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            t.published ? "text-emerald-500 border-emerald-500/30" : "text-amber-500 border-amber-500/30"
                          )}
                        >
                          {t.published ? "PUBLISHED" : "DRAFT"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">{t.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {t.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-mono truncate max-w-[120px]">{t.slug}</span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingTopic(t)}
                        className="h-7 px-2 text-xs gap-1 cursor-pointer"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setItemToDelete({ type: "topic", id: t.id, name: t.name })}
                        className="h-7 px-2 text-xs gap-1 text-destructive hover:bg-destructive/10 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="col-span-full p-8 text-center text-muted-foreground text-sm border-dashed">
                No topics in the database yet. Click &quot;Create New Topic&quot; to add your first track.
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB 2: PATTERNS INVENTORY */}
        {/* ============================================================== */}
        <TabsContent value="patterns" className="pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Pattern Inventory ({patterns.length})</h2>
              <p className="text-xs text-muted-foreground">
                All algorithmic problem-solving patterns complete with mental models, complexity, and templates.
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
              {patterns.length > 0 ? (
                patterns.map((pat) => (
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
                          {pat.timeComplexity && (
                            <Badge variant="outline" className="text-[11px] font-mono">
                              {pat.timeComplexity}
                            </Badge>
                          )}
                          <span className="text-xs text-amber-400 font-mono">
                            {"★".repeat(pat.importance || 5)}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground block truncate">
                          Track: {pat.topic?.name || "Unassigned"} • {pat._count?.problems ?? 0} Problems Attached
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/patterns/${pat.slug}`} target="_blank">
                        <Button size="sm" variant="ghost" className="text-xs h-7 px-2.5">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          <span>Preview</span>
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingPattern(pat)}
                        className="text-xs h-7 px-2.5 gap-1 cursor-pointer"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setItemToDelete({ type: "pattern", id: pat.id, name: pat.name })}
                        className="text-xs h-7 px-2.5 gap-1 text-destructive hover:bg-destructive/10 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No patterns found in the database.
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB 3: PROBLEMS INVENTORY */}
        {/* ============================================================== */}
        <TabsContent value="problems" className="pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Practice Problems Inventory ({problems.length})</h2>
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
              {problems.length > 0 ? (
                problems.map((prob) => {
                  const linkedPatternName = prob.patterns?.[0]?.pattern?.name;
                  return (
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
                            {prob.platform || "LeetCode"}
                          </span>
                        </div>
                        {linkedPatternName && (
                          <p className="text-xs text-muted-foreground">
                            Pattern: <strong className="text-foreground">{linkedPatternName}</strong>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={prob.solveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline h-7 px-2"
                        >
                          <span>Solve URL</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingProblem(prob)}
                          className="text-xs h-7 px-2.5 gap-1 cursor-pointer"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setItemToDelete({ type: "problem", id: prob.id, name: prob.title })}
                          className="text-xs h-7 px-2.5 gap-1 text-destructive hover:bg-destructive/10 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No problems registered in the database.
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB 4: ARTICLE MODERATION */}
        {/* ============================================================== */}
        <TabsContent value="moderation" className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Community Submissions Queue</h2>
              <p className="text-xs text-muted-foreground">
                Review, approve, or reject technical guides submitted by students and community members.
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
                          Submitted by {art.author?.name || "Community Member"}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-foreground">{art.title}</h3>
                      {art.excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {art.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApproveArticle(art.id)}
                        className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Approve & Publish</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectArticle(art.id)}
                        className="gap-1.5 text-xs text-amber-500 hover:bg-amber-500/10 cursor-pointer"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setItemToDelete({ type: "article", id: art.id, name: art.title })}
                        className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center text-sm text-muted-foreground border-dashed">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-foreground">Moderation queue is clean!</p>
                <p className="text-xs mt-1">No community articles currently pending review.</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ========================================================================= */}
      {/* 1. MODAL: CREATE TOPIC */}
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
                  placeholder="e.g. Dynamic Programming"
                  required
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Description</label>
                <Textarea
                  placeholder="Techniques for subproblem memoization and state transitions."
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
                    value={newTopicOrder}
                    onChange={(e) => setNewTopicOrder(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="topicPub"
                  checked={newTopicPublished}
                  onChange={(e) => setNewTopicPublished(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="topicPub" className="text-xs text-muted-foreground select-none cursor-pointer">
                  Publish immediately (visible to all students)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTopicModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmittingTopic} className="text-xs gap-1.5">
                  {isSubmittingTopic ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FolderPlus className="h-3.5 w-3.5" />}
                  <span>Save Topic</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODAL: EDIT TOPIC */}
      {/* ========================================================================= */}
      {editingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 font-bold">
                  <Edit2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Edit Topic: {editingTopic.name}</h2>
                  <p className="text-xs text-muted-foreground">Modify topic parameters and visibility</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingTopic(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateTopic} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Topic Name</label>
                <Input
                  required
                  value={editingTopic.name}
                  onChange={(e) => setEditingTopic({ ...editingTopic, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Description</label>
                <Textarea
                  rows={3}
                  value={editingTopic.description || ""}
                  onChange={(e) => setEditingTopic({ ...editingTopic, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Track Icon</label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground"
                    value={editingTopic.icon || "Target"}
                    onChange={(e) => setEditingTopic({ ...editingTopic, icon: e.target.value })}
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
                    value={editingTopic.order}
                    onChange={(e) => setEditingTopic({ ...editingTopic, order: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editTopicPub"
                  checked={editingTopic.published}
                  onChange={(e) => setEditingTopic({ ...editingTopic, published: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="editTopicPub" className="text-xs text-muted-foreground select-none cursor-pointer">
                  Published (visible to students)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingTopic(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmittingTopic} className="text-xs gap-1.5">
                  {isSubmittingTopic ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Edit2 className="h-3.5 w-3.5" />}
                  <span>Update Topic</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL: CREATE PATTERN */}
      {/* ========================================================================= */}
      {showPatternModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Create New Pattern</h2>
                  <p className="text-xs text-muted-foreground">Add an algorithmic pattern with full mental models and code templates</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPatternModal(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePattern} className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
              <Tabs value={patternModalTab} onValueChange={(v) => setPatternModalTab(v as any)} className="w-full">
                <TabsList className="grid grid-cols-3 w-full mb-4">
                  <TabsTrigger value="meta">1. Meta & Topic</TabsTrigger>
                  <TabsTrigger value="intuition">2. Intuition & Rules</TabsTrigger>
                  <TabsTrigger value="code">3. Code Templates</TabsTrigger>
                </TabsList>

                {/* TAB 1: Meta */}
                <TabsContent value="meta" className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Curriculum Topic / Track</label>
                      <select
                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground"
                        value={newPatternTopicId}
                        onChange={(e) => setNewPatternTopicId(e.target.value)}
                        required
                      >
                        {topics.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Pattern Number (#)</label>
                      <Input
                        type="number"
                        value={newPatternNumber}
                        onChange={(e) => setNewPatternNumber(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Pattern Name</label>
                    <Input
                      placeholder="e.g. Sliding Window Maximum"
                      required
                      value={newPatternName}
                      onChange={(e) => setNewPatternName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
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

                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Importance Rating (1-5)</label>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={newPatternImportance}
                        onChange={(e) => setNewPatternImportance(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Time Complexity</label>
                      <Input
                        value={newPatternTime}
                        onChange={(e) => setNewPatternTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Space Complexity</label>
                      <Input
                        value={newPatternSpace}
                        onChange={(e) => setNewPatternSpace(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Short Summary</label>
                    <Textarea
                      placeholder="One-line breakdown of when to apply this technique."
                      rows={2}
                      value={newPatternShortDesc}
                      onChange={(e) => setNewPatternShortDesc(e.target.value)}
                    />
                  </div>
                </TabsContent>

                {/* TAB 2: Intuition */}
                <TabsContent value="intuition" className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Mental Model & Core Intuition</label>
                    <Textarea
                      placeholder="Explain the underlying visual or mathematical concept..."
                      rows={4}
                      value={newPatternIntuition}
                      onChange={(e) => setNewPatternIntuition(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Interview Identification Rule</label>
                    <Input
                      placeholder="e.g. Sorted array + subarray constraints -> Two Pointer or Sliding Window"
                      value={newPatternInterviewRule}
                      onChange={(e) => setNewPatternInterviewRule(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Pseudocode Blueprint</label>
                    <Textarea
                      rows={5}
                      className="font-mono text-[11px]"
                      value={newPatternPseudocode}
                      onChange={(e) => setNewPatternPseudocode(e.target.value)}
                    />
                  </div>
                </TabsContent>

                {/* TAB 3: Code Templates */}
                <TabsContent value="code" className="space-y-3">
                  <div className="flex items-center gap-2 pb-2">
                    {(["python", "cpp", "java", "javascript"] as const).map((lang) => (
                      <Button
                        key={lang}
                        type="button"
                        size="sm"
                        variant={templateLangTab === lang ? "default" : "outline"}
                        onClick={() => setTemplateLangTab(lang)}
                        className="text-xs h-7 uppercase"
                      >
                        {lang}
                      </Button>
                    ))}
                  </div>

                  {templateLangTab === "python" && (
                    <Textarea
                      rows={9}
                      className="font-mono text-[11px]"
                      value={newPatternPy}
                      onChange={(e) => setNewPatternPy(e.target.value)}
                    />
                  )}
                  {templateLangTab === "cpp" && (
                    <Textarea
                      rows={9}
                      className="font-mono text-[11px]"
                      value={newPatternCpp}
                      onChange={(e) => setNewPatternCpp(e.target.value)}
                    />
                  )}
                  {templateLangTab === "java" && (
                    <Textarea
                      rows={9}
                      className="font-mono text-[11px]"
                      value={newPatternJava}
                      onChange={(e) => setNewPatternJava(e.target.value)}
                    />
                  )}
                  {templateLangTab === "javascript" && (
                    <Textarea
                      rows={9}
                      className="font-mono text-[11px]"
                      value={newPatternJs}
                      onChange={(e) => setNewPatternJs(e.target.value)}
                    />
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPatternModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmittingPattern} className="text-xs gap-1.5">
                  {isSubmittingPattern ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  <span>Save Pattern</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: EDIT PATTERN */}
      {/* ========================================================================= */}
      {editingPattern && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                  <Edit2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Edit Pattern: {editingPattern.name}</h2>
                  <p className="text-xs text-muted-foreground">Modify pattern formulas, intuition, and templates</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingPattern(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdatePattern} className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Topic</label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground"
                    value={editingPattern.topicId}
                    onChange={(e) => setEditingPattern({ ...editingPattern, topicId: e.target.value })}
                    required
                  >
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Number (#)</label>
                  <Input
                    type="number"
                    value={editingPattern.number}
                    onChange={(e) => setEditingPattern({ ...editingPattern, number: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Pattern Name</label>
                <Input
                  required
                  value={editingPattern.name}
                  onChange={(e) => setEditingPattern({ ...editingPattern, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Difficulty</label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground"
                    value={editingPattern.difficulty}
                    onChange={(e) => setEditingPattern({ ...editingPattern, difficulty: e.target.value as any })}
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Importance (1-5)</label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={editingPattern.importance}
                    onChange={(e) => setEditingPattern({ ...editingPattern, importance: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Time Complexity</label>
                  <Input
                    value={editingPattern.timeComplexity || ""}
                    onChange={(e) => setEditingPattern({ ...editingPattern, timeComplexity: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Space Complexity</label>
                  <Input
                    value={editingPattern.spaceComplexity || ""}
                    onChange={(e) => setEditingPattern({ ...editingPattern, spaceComplexity: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Short Summary</label>
                <Textarea
                  rows={2}
                  value={editingPattern.shortDescription || ""}
                  onChange={(e) => setEditingPattern({ ...editingPattern, shortDescription: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Core Intuition</label>
                <Textarea
                  rows={3}
                  value={editingPattern.intuition || ""}
                  onChange={(e) => setEditingPattern({ ...editingPattern, intuition: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Interview Rule</label>
                <Input
                  value={editingPattern.interviewRule || ""}
                  onChange={(e) => setEditingPattern({ ...editingPattern, interviewRule: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Pseudocode</label>
                <Textarea
                  rows={4}
                  className="font-mono text-[11px]"
                  value={editingPattern.pseudocode || ""}
                  onChange={(e) => setEditingPattern({ ...editingPattern, pseudocode: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPattern(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmittingPattern} className="text-xs gap-1.5">
                  {isSubmittingPattern ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Edit2 className="h-3.5 w-3.5" />}
                  <span>Update Pattern</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: CREATE PROBLEM */}
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
                  <h2 className="text-lg font-bold text-foreground">Add Practice Problem</h2>
                  <p className="text-xs text-muted-foreground">Register a canonical question and link it to a pattern</p>
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
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground"
                  value={newProblemPatternId}
                  onChange={(e) => setNewProblemPatternId(e.target.value)}
                >
                  {patterns.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.number} {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Problem Title</label>
                <Input
                  placeholder="e.g. 3Sum (LeetCode #15)"
                  required
                  value={newProblemTitle}
                  onChange={(e) => setNewProblemTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Platform</label>
                  <Input
                    placeholder="LeetCode / GFG / Codeforces"
                    value={newProblemPlatform}
                    onChange={(e) => setNewProblemPlatform(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
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

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Solve URL</label>
                <Input
                  placeholder="https://leetcode.com/problems/3sum/"
                  required
                  value={newProblemUrl}
                  onChange={(e) => setNewProblemUrl(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="probCore"
                  checked={newProblemIsCore}
                  onChange={(e) => setNewProblemIsCore(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="probCore" className="text-xs text-muted-foreground select-none cursor-pointer">
                  Mark as Core Canonical Problem
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProblemModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmittingProblem} className="text-xs gap-1.5">
                  {isSubmittingProblem ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  <span>Save Problem</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: EDIT PROBLEM */}
      {/* ========================================================================= */}
      {editingProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 font-bold">
                  <Edit2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Edit Problem: {editingProblem.title}</h2>
                  <p className="text-xs text-muted-foreground">Modify title, difficulty, or external link</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingProblem(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProblem} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Problem Title</label>
                <Input
                  required
                  value={editingProblem.title}
                  onChange={(e) => setEditingProblem({ ...editingProblem, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Platform</label>
                  <Input
                    value={editingProblem.platform || ""}
                    onChange={(e) => setEditingProblem({ ...editingProblem, platform: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Difficulty</label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground"
                    value={editingProblem.difficulty}
                    onChange={(e) => setEditingProblem({ ...editingProblem, difficulty: e.target.value as any })}
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Solve URL</label>
                <Input
                  required
                  value={editingProblem.solveUrl}
                  onChange={(e) => setEditingProblem({ ...editingProblem, solveUrl: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingProblem(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmittingProblem} className="text-xs gap-1.5">
                  {isSubmittingProblem ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Edit2 className="h-3.5 w-3.5" />}
                  <span>Update Problem</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. DELETION CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-destructive/40 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Confirm Deletion
                </h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-foreground/90 leading-relaxed bg-muted/30 p-3 rounded-lg border border-border">
              Are you sure you want to delete {itemToDelete.type} &quot;<strong>{itemToDelete.name}</strong>&quot;? All associated relations will be removed.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="text-xs gap-1.5 cursor-pointer"
              >
                {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                <span>Permanently Delete</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
