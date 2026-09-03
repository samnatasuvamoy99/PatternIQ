"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MOCK_PATTERNS, MOCK_TOPICS, MOCK_ARTICLES } from "@/lib/mock-data";
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
} from "lucide-react";

export default function AdminPage() {
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

  const handleApprove = (id: string) => {
    setPendingArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const handleReject = (id: string) => {
    setPendingArticles((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary mb-2">
            <Shield className="h-3.5 w-3.5" />
            <span>Admin Console</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Administration</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage curriculum tracks, patterns, problems, and moderate community submissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/patterns">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              <Layers className="h-3.5 w-3.5" />
              <span>View Live Catalog</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* OVERVIEW STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Registered Users</span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-3xl font-extrabold mt-2">1,248</p>
          <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" /> +14% this week
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Published Patterns</span>
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <p className="text-3xl font-extrabold mt-2">{MOCK_PATTERNS.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Across 6 topics</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Curated Problems</span>
            <FileText className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold mt-2">150</p>
          <p className="text-xs text-muted-foreground mt-1">LeetCode benchmarks</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Moderation Queue</span>
            <span className="flex h-2 w-2 rounded-full bg-amber-500" />
          </div>
          <p className="text-3xl font-extrabold mt-2 text-amber-500">{pendingArticles.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Pending community reviews</p>
        </Card>
      </div>

      {/* ADMIN TABS */}
      <Tabs defaultValue="moderation" className="w-full">
        <TabsList className="grid grid-cols-2 w-full sm:w-80">
          <TabsTrigger value="moderation">Article Queue ({pendingArticles.length})</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Inventory</TabsTrigger>
        </TabsList>

        {/* TAB 1: Moderation Queue */}
        <TabsContent value="moderation" className="pt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pending Submissions</CardTitle>
              <CardDescription>
                Review and approve technical community articles before publication
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border/60">
              {pendingArticles.length > 0 ? (
                pendingArticles.map((art) => (
                  <div key={art.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{art.category}</Badge>
                        <span className="text-xs text-muted-foreground">by {art.author} • {art.submittedAt}</span>
                      </div>
                      <h4 className="font-semibold text-foreground text-sm sm:text-base">{art.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{art.excerpt}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(art.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 h-8"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Publish</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(art.id)}
                        className="text-xs gap-1 h-8"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  The article moderation queue is empty!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Pattern Inventory */}
        <TabsContent value="patterns" className="pt-4 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Published Patterns</CardTitle>
                <CardDescription>Active patterns in the curriculum</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-border/60">
              {MOCK_PATTERNS.map((pat) => (
                <div key={pat.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                      #{pat.number}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{pat.name}</p>
                      <p className="text-xs text-muted-foreground">{pat.topicName} • {pat.problems.length} Problems</p>
                    </div>
                  </div>

                  <Link href={`/patterns/${pat.slug}`}>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      View Pattern
                    </Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
