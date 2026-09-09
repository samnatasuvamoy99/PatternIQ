"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setAuthSession } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function completeExchange() {
      try {
        const res = await fetch("/api/v1/auth/pramaan/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();

        if (!res.ok || !data.success || !data.data) {
          throw new Error(data.error?.message || "Failed to complete authentication with Pramaan");
        }

        if (isMounted) {
          setAuthSession(data.data.user, data.data.accessToken, data.data.refreshToken);
          const target = data.data.redirect || "/dashboard";
          router.replace(target);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "An unexpected error occurred during login.");
        }
      }
    }

    completeExchange();

    return () => {
      isMounted = false;
    };
  }, [router, setAuthSession]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 text-center">
        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-destructive">Authentication Failed</h2>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => router.replace("/login")}
            >
              Back to Sign in
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-md p-8 shadow-lg space-y-4">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight">Authenticating with Pramaan</h2>
              <p className="text-sm text-muted-foreground">
                Verifying your credentials and signing you into PatternIQ...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
