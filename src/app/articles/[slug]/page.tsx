"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AuthGuard } from "@/components/auth/auth-guard";
import { MOCK_ARTICLES } from "@/lib/mock-data";
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Share2,
  Clock,
  MessageSquare,
  Send,
  CornerDownRight,
} from "lucide-react";

interface Comment {
  id: string;
  author: string;
  date: string;
  text: string;
  replies?: Comment[];
}

export default function ArticleDetailPage({ params }: { params: { slug: string } }) {
  const article = MOCK_ARTICLES.find((a) => a.slug === params.slug) || MOCK_ARTICLES[0];

  const [likes, setLikes] = useState(article.likesCount);
  const [hasLiked, setHasLiked] = useState(article.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(article.isBookmarked || false);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: "c1",
      author: "Marcus Vance",
      date: "1 day ago",
      text: "This mental framework completely changed how I look at Sliding Window problems. Super concise and well explained!",
      replies: [
        {
          id: "c1-1",
          author: article.author.name,
          date: "18 hours ago",
          text: "Glad it helped Marcus! Once you identify the constraint contraction condition, the rest of the template falls right into place.",
        },
      ],
    },
    {
      id: "c2",
      author: "Elena Rostova",
      date: "5 hours ago",
      text: "Do you recommend writing pseudocode first on a whiteboard during actual FAANG interviews?",
    },
  ]);

  const [newComment, setNewComment] = useState("");

  const toggleLike = () => {
    if (hasLiked) {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        author: "You",
        date: "Just now",
        text: newComment.trim(),
      },
    ]);
    setNewComment("");
  };

  return (
    <AuthGuard>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Back link */}
      <Link href="/articles" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Articles</span>
      </Link>

      {/* Article Header */}
      <div className="space-y-4 border-b border-border pb-6">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{article.category}</Badge>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{article.readTime}</span>
            <span>•</span>
            <span>Published {article.publishedAt}</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          {article.title}
        </h1>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
              {article.author.name[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{article.author.name}</p>
              <p className="text-xs text-muted-foreground">Software Engineer & Educator</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={hasLiked ? "default" : "outline"}
              onClick={toggleLike}
              className="gap-1.5 text-xs h-8"
            >
              <Heart className={`h-3.5 w-3.5 ${hasLiked ? "fill-current" : ""}`} />
              <span>{likes}</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="gap-1.5 text-xs h-8"
            >
              <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
              <span>{isBookmarked ? "Saved" : "Save"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Article Body Content */}
      <article className="prose prose-neutral dark:prose-invert max-w-none text-foreground space-y-6 leading-relaxed">
        <p className="text-base text-muted-foreground font-medium italic border-l-2 border-primary pl-4">
          {article.excerpt}
        </p>

        <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed space-y-4">
          {article.content}
        </div>
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
            <Button size="sm" onClick={handleAddComment} className="gap-1.5 text-xs">
              <Send className="h-3.5 w-3.5" />
              <span>Post Comment</span>
            </Button>
          </div>
        </Card>

        {/* Comments list */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  {comment.author}
                </span>
                <span className="text-[11px] text-muted-foreground">{comment.date}</span>
              </div>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                {comment.text}
              </p>

              {/* Nested replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="pl-4 border-l-2 border-border/80 space-y-2 mt-2">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="rounded-lg bg-muted/40 p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary">
                          {reply.author}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{reply.date}</span>
                      </div>
                      <p className="text-xs text-foreground/90">{reply.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
