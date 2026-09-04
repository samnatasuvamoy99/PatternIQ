"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Users } from "lucide-react";

export default function AdminUsersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin?tab=users");
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
        <Users className="h-6 w-6" />
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold">Loading Registered Users...</h2>
        <p className="text-xs text-muted-foreground">Redirecting to platform administrator users console</p>
      </div>
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
    </div>
  );
}
