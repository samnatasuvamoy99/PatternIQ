"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthGuard } from "@/components/auth/auth-guard";
import { apiClient } from "@/lib/api-client";
import {
  FileText,
  Search,
  PenSquare,
  Heart,
  MessageSquare,
  Bookmark,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";

const CATEGORIES = [
  "ALL",
  "DSA",
  "SYSTEM_DESIGN",
  "DEVELOPMENT",
  "CORE_CS",
  "DATABASE",
  "DEVOPS",
  "GENAI",
  "PROGRAMMING",
];

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  publishedAt: string;
  readTime: string;
  author: {
    name: string;
    avatar?: string;
  };
  likesCount: number;
  commentsCount: number;
  isBookmarked: boolean;
}

export default function ArticlesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch live articles from API
  useEffect(() => {
    async function loadArticles() {
      setIsLoading(true);
      try {
        const res = await apiClient<{ items: any[]; pagination: any }>("/articles?limit=50");
        if (res.success && res.data?.items) {
          const mapped: ArticleItem[] = res.data.items.map((a: any) => ({
            id: a.id,
            title: a.title,
            slug: a.slug,
            excerpt: a.excerpt || (a.content ? a.content.slice(0, 150) + "..." : ""),
            content: a.content || "",
            category: a.category || "DSA",
            publishedAt: a.publishedAt
              ? new Date(a.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recently",
            readTime: `${Math.max(1, Math.round((a.content?.split(/\s+/).length || 200) / 200))} min read`,
            author: {
              name: a.author?.name || "Community Author",
              avatar: a.author?.avatar,
            },
            likesCount: a.stats?.likes ?? a._count?.likes ?? 0,
            commentsCount: a.stats?.comments ?? a._count?.comments ?? 0,
            isBookmarked: a.userState?.bookmarked ?? false,
          }));
          setArticles(mapped);
        }
      } catch (err) {
        console.error("Failed to load articles from API", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadArticles();
  }, []);

  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.author.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" || art.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const toggleBookmark = async (id: string) => {
    const article = articles.find((a) => a.id === id);
    if (!article) return;

    const nextBookmarked = !article.isBookmarked;
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isBookmarked: nextBookmarked } : a))
    );

    try {
      await apiClient(`/articles/${id}/bookmark`, {
        method: nextBookmarked ? "POST" : "DELETE",
      });
    } catch (e) {
      console.error("Failed to update bookmark", e);
    }
  };

  return (
    <AuthGuard>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Technical Articles & Guides</h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              In-depth engineering deep dives, pattern breakdowns, and interview wisdom contributed by the community.
            </p>
          </div>

          <Link href="/articles/new">
            <Button className="gap-2 shadow-sm">
              <PenSquare className="h-4 w-4" />
              <span>Write an Article</span>
            </Button>
          </Link>
        </div>

        {/* Filter and Category Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles, authors, topics..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="text-xs"
              >
                {cat.replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>

        {/* Article Cards Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading community articles...</p>
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                className="flex flex-col justify-between hover:border-primary/50 transition-all hover:shadow-md"
              >
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {article.category}
                    </Badge>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{article.readTime}</span>
                      <span>•</span>
                      <span>{article.publishedAt}</span>
                    </div>
                  </div>

                  <Link href={`/articles/${article.slug}`}>
                    <CardTitle className="text-xl hover:text-primary transition-colors cursor-pointer leading-snug">
                      {article.title}
                    </CardTitle>
                  </Link>
                  <CardDescription className="text-xs line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="flex items-center justify-between border-t border-border/50 pt-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                        {article.author.name[0]}
                      </div>
                      <span className="text-xs font-medium text-foreground">
                        {article.author.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5 text-rose-500" />
                        <span>{article.likesCount}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{article.commentsCount}</span>
                      </span>
                      <button
                        onClick={() => toggleBookmark(article.id)}
                        className="hover:text-primary transition-colors cursor-pointer"
                        aria-label="Bookmark"
                      >
                        <Bookmark
                          className={`h-4 w-4 ${
                            article.isBookmarked ? "fill-primary text-primary" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center text-muted-foreground text-sm border-dashed">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No articles found matching your filter criteria.</p>
            <p className="text-xs mt-1">Be the first to publish an article in this category!</p>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}
