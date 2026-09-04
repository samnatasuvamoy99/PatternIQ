"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { Shield, Lock, Mail, User, KeyRound, ArrowRight, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function AdminSignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("PatternIQAdmin2026");
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
      }>("/auth/admin/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, adminKey }),
      });

      if (res.success && res.data) {
        // Save tokens & user with admin role
        localStorage.setItem("patterniq_access_token", res.data.accessToken);
        localStorage.setItem("patterniq_refresh_token", res.data.refreshToken);
        localStorage.setItem("patterniq_user", JSON.stringify(res.data.user));

        // Reload window / redirect to trigger auth state update
        window.location.href = "/admin";
      } else {
        setError(res.error?.message || "Failed to create administrator account.");
      }
    } catch (err: any) {
      setError(err?.message || "Network error. Failed to reach auth server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Top bar navigation */}
        <div className="flex justify-between items-center px-1">
          <Link
            href="/admin/signin"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Admin Sign In</span>
          </Link>
        </div>

        {/* Card */}
        <Card className="border-border/80 shadow-xl overflow-hidden bg-card">
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-primary" />

          <CardHeader className="space-y-2 pb-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 shadow-xs border border-amber-500/20">
              <Shield className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Enroll New Administrator
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Create an administrative user with full governance and curriculum publishing permissions.
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
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Full Legal / Admin Name</span>
                </label>
                <Input
                  placeholder="Alex Rivera"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Official Admin Email</span>
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
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Master Password (min 8 chars)</span>
                </label>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                    <span>Administrator Security Key</span>
                  </label>
                  <span className="text-[10px] text-muted-foreground font-mono">Demo: PatternIQAdmin2026</span>
                </div>
                <Input
                  type="text"
                  placeholder="PatternIQAdmin2026"
                  required
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  disabled={isLoading}
                  className="font-mono text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Security authorization passkey required to elevate account to the `ADMIN` role.
                </p>
              </div>

              <Button type="submit" className="w-full text-xs font-semibold h-10 gap-1.5 mt-2" disabled={isLoading}>
                <span>{isLoading ? "Provisioning..." : "Create Administrator Account"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 border-t border-border/60 bg-muted/20 py-4 text-center text-xs text-muted-foreground">
            <div>
              Already have an admin account?{" "}
              <Link href="/admin/signin" className="font-semibold text-primary hover:underline">
                Sign In to Console
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
