"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AuthGuard } from "@/components/auth/auth-guard";
import { apiClient } from "@/lib/api-client";
import { CodeViewer } from "@/components/ui/code-viewer";
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Clock,
  MessageSquare,
  Send,
  Loader2,
  FileText,
} from "lucide-react";

interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  user?: {
    name: string;
    avatar?: string;
  };
  replies?: CommentItem[];
}

interface ArticleDetail {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category: string;
  subtopic?: string;
  publishedAt?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  stats?: {
    likes: number;
    comments: number;
  };
  userState?: {
    liked: boolean;
    bookmarked: boolean;
  };
}

function ArticleContentRenderer({ content }: { content: string }) {
  if (!content) return null;

  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-4 text-foreground/90 leading-relaxed text-sm sm:text-base">
      {parts.map((part, idx) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const firstLineEnd = part.indexOf("\n");
          let language = "code";
          let code = "";
          if (firstLineEnd !== -1) {
            language = part.slice(3, firstLineEnd).trim() || "code";
            code = part.slice(firstLineEnd + 1, -3);
          } else {
            code = part.slice(3, -3);
          }
          return (
            <div key={idx} className="my-4">
              <CodeViewer code={code.trim()} language={language} title={`${language} snippet`} />
            </div>
          );
        }

        const lines = part.split("\n");
        return (
          <div key={idx} className="space-y-2.5">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;
              if (trimmed.startsWith("### ")) {
                return (
                  <h3 key={lineIdx} className="text-base sm:text-lg font-bold text-foreground mt-4 mb-1">
                    {trimmed.slice(4)}
                  </h3>
                );
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h2 key={lineIdx} className="text-lg sm:text-xl font-extrabold text-foreground mt-6 mb-2 border-b border-border/40 pb-1.5">
                    {trimmed.slice(3)}
                  </h2>
                );
              }
              if (trimmed.startsWith("# ")) {
                return (
                  <h1 key={lineIdx} className="text-xl sm:text-2xl font-black text-foreground mt-6 mb-2">
                    {trimmed.slice(2)}
                  </h1>
                );
              }
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                return (
                  <li key={lineIdx} className="ml-4 list-disc text-muted-foreground pl-1">
                    <span className="text-foreground">{trimmed.slice(2)}</span>
                  </li>
                );
              }
              return (
                <p key={lineIdx} className="text-muted-foreground leading-relaxed">
                  {line}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function ArticleDetailPage({ params }: { params: { slug: string } }) {
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Fetch live article & comments
  useEffect(() => {
    async function loadArticleData() {
      setIsLoading(true);
      try {
        const res = await apiClient<ArticleDetail>(`/articles/${params.slug}`);
        if (res.success && res.data) {
          const art = res.data;
          setArticle(art);
          setLikes(art.stats?.likes || 0);
          setHasLiked(art.userState?.liked || false);
          setIsBookmarked(art.userState?.bookmarked || false);

          // Fetch comments for this article
          const commentsRes = await apiClient<CommentItem[]>(`/articles/${art.id}/comments`);
          if (commentsRes.success && Array.isArray(commentsRes.data)) {
            setComments(commentsRes.data);
          }
        } else {
          setArticle(null);
        }
      } catch (err) {
        console.error("Failed to load article", err);
        setArticle(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadArticleData();
  }, [params.slug]);

  const toggleLike = async () => {
    if (!article) return;
    const nextLiked = !hasLiked;
    setHasLiked(nextLiked);
    setLikes((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await apiClient(`/articles/${article.id}/like`, {
        method: nextLiked ? "POST" : "DELETE",
      });
    } catch (e) {
      console.error("Failed to toggle like", e);
    }
  };

  const toggleBookmark = async () => {
    if (!article) return;
    const nextBookmarked = !isBookmarked;
    setIsBookmarked(nextBookmarked);

    try {
      await apiClient(`/articles/${article.id}/bookmark`, {
        method: nextBookmarked ? "POST" : "DELETE",
      });
    } catch (e) {
      console.error("Failed to toggle bookmark", e);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !article || isSubmittingComment) return;
    setIsSubmittingComment(true);

    try {
      const res = await apiClient<CommentItem>(`/articles/${article.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (res.success && res.data) {
        setComments((prev) => [res.data!, ...prev]);
        setNewComment("");
      }
    } catch (e) {
      console.error("Failed to post comment", e);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const readTime = article?.content
    ? `${Math.max(1, Math.round(article.content.split(/\s+/).length / 200))} min read`
    : "3 min read";

  const formattedDate = article?.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently published";

  return (
    <AuthGuard>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Back link */}
        <Link href="/articles" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Articles</span>
        </Link>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading article content...</p>
          </div>
        ) : !article ? (
          <Card className="p-12 text-center space-y-4 border-dashed">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold">Article not found</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              This article does not exist or may have been removed.
            </p>
            <div className="pt-2">
              <Link href="/articles">
                <Button variant="outline">Browse All Articles</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <>
            {/* Article Header */}
            <div className="space-y-4 border-b border-border pb-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{article.category}</Badge>
                {article.subtopic && (
                  <Badge variant="outline" className="text-xs">{article.subtopic}</Badge>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{readTime}</span>
                  <span>•</span>
                  <span>Published {formattedDate}</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                {article.title}
              </h1>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                    {article.author?.name ? article.author.name[0] : "A"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {article.author?.name || "Community Author"}
                    </p>
                    <p className="text-xs text-muted-foreground">Software Engineer & Contributor</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={hasLiked ? "default" : "outline"}
                    onClick={toggleLike}
                    className="gap-1.5 text-xs h-8 cursor-pointer"
                  >
                    <Heart className={`h-3.5 w-3.5 ${hasLiked ? "fill-current" : ""}`} />
                    <span>{likes}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={toggleBookmark}
                    className="gap-1.5 text-xs h-8 cursor-pointer"
                  >
                    <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
                    <span>{isBookmarked ? "Saved" : "Save"}</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Article Body Content */}
            <article className="prose prose-neutral dark:prose-invert max-w-none text-foreground space-y-6 leading-relaxed">
              {article.excerpt && (
                <p className="text-base text-muted-foreground font-medium italic border-l-2 border-primary pl-4">
                  {article.excerpt}
                </p>
              )}

              <ArticleContentRenderer content={article.content} />
            </article>

            {/* COMMENTS & DISCUSSION SECTION */}
            <div className="border-t border-border pt-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span>Discussion ({comments.length})</span>
                </h3>
              </div>

              {/* Comment input form */}
              <Card className="p-4 space-y-3">
                <Textarea
                  placeholder="Share your thoughts or ask a clarifying question..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="text-sm"
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    disabled={isSubmittingComment || !newComment.trim()}
                    className="gap-1.5 text-xs cursor-pointer"
                  >
                    {isSubmittingComment ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    <span>Post Comment</span>
                  </Button>
                </div>
              </Card>

              {/* Comments list */}
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <Card key={comment.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                            {comment.user?.name ? comment.user.name[0] : "U"}
                          </div>
                          <span className="text-xs font-semibold text-foreground">
                            {comment.user?.name || "Community Member"}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {comment.createdAt
                            ? new Date(comment.createdAt).toLocaleDateString()
                            : "Recently"}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-foreground/90 pl-8 leading-relaxed">
                        {comment.content}
                      </p>
                    </Card>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic text-center py-4">
                    No comments yet. Be the first to start the discussion!
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
