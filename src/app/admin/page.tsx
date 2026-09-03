"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { apiClient } from "@/lib/api-client";
import { MOCK_PATTERNS, MOCK_TOPICS, MOCK_ARTICLES } from "@/lib/mock-data";
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
  RefreshCw,
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const { user, logout, isLoading: isAuthContextLoading } = useAuth();

  // Verification state: null = verifying, true = verified admin, false = denied
  const [isAdminVerified, setIsAdminVerified] = useState<boolean | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifiedAdminUser, setVerifiedAdminUser] = useState<any>(null);

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

      // Verification failed (invalid/expired token)
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Admin Verified Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-0.5 text-xs font-semibold text-amber-500 mb-2">
            <Shield className="h-3.5 w-3.5" />
            <span>Admin Console • Verified Authorization</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Administration</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Logged in as <strong className="text-foreground">{currentAdmin?.name}</strong> ({currentAdmin?.email}) • <Badge variant="outline" className="text-[11px] font-mono border-amber-500/40 text-amber-500">ADMIN</Badge>
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

      {/* OVERVIEW STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Patterns</p>
            <p className="text-2xl font-bold font-mono text-foreground">{MOCK_PATTERNS.length}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Layers className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Curriculum Tracks</p>
            <p className="text-2xl font-bold font-mono text-foreground">{MOCK_TOPICS.length}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <TrendingUp className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Students</p>
            <p className="text-2xl font-bold font-mono text-foreground">1,420</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Users className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Articles</p>
            <p className="text-2xl font-bold font-mono text-amber-500">{pendingArticles.length}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <FileText className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* ADMIN TABS: Patterns, Submissions, Governance */}
      <Tabs defaultValue="moderation" className="w-full">
        <TabsList className="grid grid-cols-2 max-w-md">
          <TabsTrigger value="moderation">Article Moderation ({pendingArticles.length})</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Inventory</TabsTrigger>
        </TabsList>

        {/* TAB 1: MODERATION QUEUE */}
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

        {/* TAB 2: PATTERNS INVENTORY */}
        <TabsContent value="patterns" className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Curriculum Pattern Inventory</h2>
              <p className="text-xs text-muted-foreground">
                All live algorithmic patterns published across topics.
              </p>
            </div>
            <Link href="/admin">
              <Button size="sm" className="gap-1 text-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>New Pattern</span>
              </Button>
            </Link>
          </div>

          <Card>
            <div className="divide-y divide-border/60">
              {MOCK_PATTERNS.map((pat) => (
                <div
                  key={pat.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono shrink-0">
                      #{pat.number}
                    </span>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate text-foreground">{pat.name}</span>
                        <Badge variant={pat.difficulty === "EASY" ? "easy" : "medium"}>
                          {pat.difficulty}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground block truncate">
                        Track: {pat.topicName} • {pat.problems.length} Attached Practice Problems
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
      </Tabs>
    </div>
  );
}
