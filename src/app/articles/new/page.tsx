"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Eye, PenSquare } from "lucide-react";

const CATEGORIES = ["DSA", "SYSTEM_DESIGN", "DEVELOPMENT", "CORE_CS", "DATABASE", "GENAI"];

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("DSA");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/articles");
      }, 1500);
    }, 800);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Back link */}
      <Link href="/articles" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Articles</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Draft Technical Article</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Share your algorithmic breakdowns and engineering insights with the community.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={isPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className="gap-1.5 text-xs"
          >
            {isPreview ? <PenSquare className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span>{isPreview ? "Edit Mode" : "Preview"}</span>
          </Button>
        </div>
      </div>

      {success && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400">
          Article submitted successfully! Redirecting to feed...
        </div>
      )}

      {isPreview ? (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{category}</Badge>
            <span className="text-xs text-muted-foreground">Preview Mode</span>
          </div>
          <h2 className="text-3xl font-bold">{title || "Untitled Article"}</h2>
          {excerpt && (
            <p className="text-sm font-medium italic border-l-2 border-primary pl-3 text-muted-foreground">
              {excerpt}
            </p>
          )}
          <div className="whitespace-pre-line text-sm leading-relaxed text-foreground/90 pt-4 border-t border-border">
            {content || "No content written yet."}
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card className="space-y-6 p-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Article Title</label>
              <Input
                placeholder="e.g. How to Tackle Sliding Window Problems in 4 Steps"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat}
                    type="button"
                    variant={category === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategory(cat)}
                    className="text-xs"
                  >
                    {cat.replace("_", " ")}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Brief Excerpt</label>
              <Input
                placeholder="One or two sentences summarizing the key takeaway..."
                required
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Article Content (Markdown supported)</label>
              <Textarea
                placeholder="Write your technical article, pseudocode explanations, and code examples..."
                required
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="font-mono text-xs leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs text-muted-foreground">
                Submitted articles are reviewed before appearing publicly.
              </span>
              <Button type="submit" disabled={isSubmitting} className="gap-2 text-xs">
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? "Submitting..." : "Submit for Review"}</span>
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
}
