import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground selection:bg-primary selection:text-primary-foreground">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-8 shadow-sm text-card-foreground">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <span>Theme Preset:</span>
          <span className="font-mono text-foreground font-semibold">b3F4GrJpa6</span>
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          PatternIQ
        </h1>
        <p className="mt-2 text-base text-muted-foreground leading-relaxed">
          Master DSA Patterns with structured learning, spaced repetition, and rich interactive components.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant="default">Primary Action</Button>
          <Button variant="secondary">Secondary Action</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>

        <div className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground flex justify-between items-center">
          <span>API: <code>/api/v1</code></span>
          <span>shadcn/ui + Tailwind CSS</span>
        </div>
      </div>
    </main>
  );
}
