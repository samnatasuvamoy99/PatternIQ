import Link from "next/link";
import { Layers } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card text-card-foreground">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 font-bold tracking-tight text-foreground">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Layers className="h-4 w-4" />
              </div>
              <span>Pattern<span className="text-primary font-black">IQ</span></span>
            </div>
            <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
              A modern, systematic DSA pattern learning platform designed to help software engineers master interview problem patterns with intuition, code templates, and automated spaced repetition.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Learning Tracks</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/patterns" className="hover:text-foreground">Browse Patterns by Topic</Link></li>
              <li><Link href="/patterns" className="hover:text-foreground">All 14+ Patterns</Link></li>
              <li><Link href="/problems" className="hover:text-foreground">Curated Problem Set</Link></li>
              <li><Link href="/revision" className="hover:text-foreground">Spaced Repetition</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/articles" className="hover:text-foreground">Community Articles</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground">Student Dashboard</Link></li>
              <li><Link href="/login" className="hover:text-foreground">Sign In / Register</Link></li>
              <li><a href="/api/v1/health" target="_blank" className="hover:text-foreground">API Status</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} PatternIQ. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Next.js 14 App Router</span>
            <span>•</span>
            <span>Tailwind CSS + shadcn</span>
            <span>•</span>
            <span>Prisma ORM</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
