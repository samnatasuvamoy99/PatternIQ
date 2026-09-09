"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PramaanButtonProps {
  redirect?: string;
  mode?: "signin" | "signup";
  className?: string;
}

export function PramaanButton({
  redirect = "/dashboard",
  mode = "signin",
  className,
}: PramaanButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    const loginUrl = `/api/v1/auth/pramaan/login?redirect=${encodeURIComponent(redirect)}`;
    window.location.href = loginUrl;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "relative flex w-full items-center justify-center gap-2.5 rounded-lg bg-[#FF9644] hover:bg-[#FA812F] py-2.5 px-4 text-sm font-semibold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#FF9644]/40 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-white" />
      ) : (
        <svg
          className="h-5 w-5 shrink-0 text-white"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L3 7V12C3 17.52 6.84 22.74 12 24C17.16 22.74 21 17.52 21 12V7L12 2Z"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 14V17M10 17H14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span>{mode === "signup" ? "Sign up with Pramaan" : "Continue with Pramaan"}</span>
    </button>
  );
}
