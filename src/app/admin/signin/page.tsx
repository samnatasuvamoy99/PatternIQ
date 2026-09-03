"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Shield, Lock, Mail, ArrowRight, Sparkles, AlertCircle, ArrowLeft } from "lucide-react";

export default function AdminSignInPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await apiClient<{
        user: { id: string; name: string; email: string; role: string };
        accessToken: string;
        refreshToken: string;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (res.success && res.data) {
        if (res.data.user.role !== "ADMIN") {
          setError("Access Denied: This account is registered as a Student. Administrator privileges are required.");
          setIsLoading(false);
          return;
        }

        // Store tokens & user
        localStorage.setItem("patterniq_access_token", res.data.accessToken);
        localStorage.setItem("patterniq_refresh_token", res.data.refreshToken);
        localStorage.setItem("patterniq_user", JSON.stringify(res.data.user));

        // Reload window / redirect to trigger auth state update
        window.location.href = "/admin";
      } else {
        setError(res.error?.message || "Invalid administrator credentials");
      }
    } catch (err: any) {
      // Fallback for offline demo mode
      if (email === "admin@dsaplatform.com" && password === "Admin@12345") {
        const adminUser = {
          id: "admin-demo-1",
          name: "Platform Admin",
          email: "admin@dsaplatform.com",
          role: "ADMIN" as const,
        };
        localStorage.setItem("patterniq_user", JSON.stringify(adminUser));
        localStorage.setItem("patterniq_access_token", "demo-admin-token");
        window.location.href = "/admin";
        return;
      }
      setError(err?.message || "Network error. Failed to reach auth server.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail("admin@dsaplatform.com");
    setPassword("Admin@12345");
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Back Link */}
        <div className="flex justify-between items-center px-1">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Student Portal Sign In</span>
          </Link>
          <Badge variant="outline" className="border-amber-500/40 text-amber-500 gap-1 text-[11px] font-mono">
            <Shield className="h-3 w-3" /> RESTRICTED
          </Badge>
        </div>

        {/* Card */}
        <Card className="border-border/80 shadow-xl overflow-hidden bg-card">
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-primary" />

          <CardHeader className="space-y-2 pb-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 shadow-xs border border-amber-500/20">
              <Shield className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Admin Portal
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Enter authorized administrator credentials to manage curriculum, patterns, and content.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Admin Email</span>
                </label>
                <Input
                  type="email"
                  placeholder="admin@dsaplatform.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Password</span>
                  </label>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full text-xs font-semibold h-10 gap-1.5" disabled={isLoading}>
                <span>{isLoading ? "Verifying..." : "Authenticate as Admin"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </form>

            {/* Demo Helper Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="w-full rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 p-2.5 text-left text-xs text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <p className="font-semibold flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> Quick Fill Demo Admin
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    admin@dsaplatform.com • Admin@12345
                  </p>
                </div>
                <span className="text-[11px] underline">Fill Form</span>
              </button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 border-t border-border/60 bg-muted/20 py-4 text-center text-xs text-muted-foreground">
            <div>
              New administrator?{" "}
              <Link href="/admin/signup" className="font-semibold text-primary hover:underline">
                Create Admin Account
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
