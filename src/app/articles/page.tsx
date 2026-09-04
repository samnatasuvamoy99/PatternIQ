"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthGuard } from "@/components/auth/auth-guard";
import { MOCK_ARTICLES, ArticleData } from "@/lib/mock-data";
import {
  FileText,
  Search,
  PenSquare,
  Heart,
  MessageSquare,
  Bookmark,
  Clock,
  ArrowRight,
} from "lucide-react";

const CATEGORIES = ["ALL", "DSA", "SYSTEM_DESIGN", "DEVELOPMENT", "CORE_CS"];

export default function ArticlesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [articles, setArticles] = useState<ArticleData[]>(MOCK_ARTICLES);

  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.author.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" || art.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const toggleBookmark = (id: string) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isBookmarked: !a.isBookmarked } : a))
    );
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
                    className="hover:text-primary transition-colors"
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
    </div>
    </AuthGuard>
  );
}
