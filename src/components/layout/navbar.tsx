"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { Button } from "@/components/ui/button";
import {
  Brain,
  BookOpen,
  LayoutDashboard,
  Layers,
  Repeat,
  FileText,
  Search,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Shield,
  User as UserIcon,
  Lock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/patterns", name: "Patterns", label: "Patterns", icon: Layers },
  { href: "/problems", name: "Problems", label: "Problems", icon: FileText },
  { href: "/revision", name: "Revision", label: "Revision", icon: Repeat },
  { href: "/articles", name: "Articles", label: "Articles", icon: BookOpen },
];

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/admin/signin",
  "/admin/signup",
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Do not render navbar on authentication pages
  const isAuthPage = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isAuthPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-foreground transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <Brain className="h-5 w-5" />
          </div>
          <span className="text-xl font-heading">
            Pattern<span className="text-primary font-black">IQ</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            const targetHref = user ? item.href : `/login?redirect=${encodeURIComponent(item.href)}`;
            return (
              <Link
                key={item.href}
                href={targetHref}
                title={!user ? `${item.name} (Sign in required)` : item.name}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
                {!user && (
                  <Lock className="h-3 w-3 text-muted-foreground/50 ml-0.5" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {mounted ? (
              isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
            ) : (
              <span className="h-4 w-4" />
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              {user.role === "ADMIN" && (
                <Link href="/admin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Button>
                </Link>
              )}
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLogoutConfirm(true)}
                aria-label="Logout"
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="default" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground"
          >
            {mounted ? (
              isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
            ) : (
              <span className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-foreground hover:bg-muted"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background px-4 pt-2 pb-4 md:hidden">
          <div className="space-y-1">
            {NAV_LINKS.map((item) => {
              const targetHref = user ? item.href : `/login?redirect=${encodeURIComponent(item.href)}`;
              return (
                <Link
                  key={item.href}
                  href={targetHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium",
                    pathname.startsWith(item.href)
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  {!user && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
                      <Lock className="h-3 w-3" />
                      <span>Sign in</span>
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
          <div className="mt-4 border-t border-border pt-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-foreground hover:underline"
                  >
                    Dashboard ({user.name})
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => setShowLogoutConfirm(true)}>
                    Log Out
                  </Button>
                </div>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm font-medium text-primary hover:underline pt-1"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin Console</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="default" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal - Portaled to document.body to avoid navbar stacking context / blur issues */}
      {showLogoutConfirm &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex min-h-screen w-screen items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <div
              className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <LogOut className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Sign out of PatternIQ?</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Are you sure you want to log out?</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You will need to sign back in to access your study progress, revision queue, and personalized problem list.
              </p>
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="gap-1.5"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Yes, Log Out</span>
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
