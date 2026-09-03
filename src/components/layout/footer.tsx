import Link from "next/link";
import { Brain } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-muted/60 dark:bg-card text-card-foreground">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5 font-bold tracking-tight text-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <Brain className="h-4 w-4" />
              </div>
              <span className="text-lg font-heading">Pattern<span className="text-primary font-black">IQ</span></span>
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
            <Link href="/patterns" className="hover:text-foreground">Patterns</Link>
            <span>•</span>
            <Link href="/problems" className="hover:text-foreground">Problems</Link>
            <span>•</span>
            <Link href="/revision" className="hover:text-foreground">Revision</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
