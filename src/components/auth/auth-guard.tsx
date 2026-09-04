"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Lock } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading && !user) {
      const queryString = searchParams?.toString();
      const destination = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(`/login?redirect=${encodeURIComponent(destination)}`);
    }
  }, [user, isLoading, router, pathname, searchParams]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Lock className="h-6 w-6 animate-pulse" />
          )}
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {isLoading ? "Checking authentication..." : "Redirecting to sign in..."}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
