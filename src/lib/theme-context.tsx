"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "dark" | "light";

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

export const THEME_STORAGE_KEY = "patterniq_theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Read current class from documentElement initially if already executed by inline script
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
        if (stored === "dark" || stored === "light") {
          return stored;
        }
        if (document.documentElement.classList.contains("dark")) {
          return "dark";
        }
      } catch {}
    }
    return "dark";
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      let activeTheme: ThemeMode = "dark";

      if (stored === "dark" || stored === "light") {
        activeTheme = stored;
      } else {
        // Fetch user default system preference and fix to that initially
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        activeTheme = prefersDark ? "dark" : "light";
        localStorage.setItem(THEME_STORAGE_KEY, activeTheme);
      }

      setThemeState(activeTheme);
      if (activeTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      // Sync across tabs
      const handleStorage = (e: StorageEvent) => {
        if (e.key === THEME_STORAGE_KEY && (e.newValue === "dark" || e.newValue === "light")) {
          setThemeState(e.newValue);
          if (e.newValue === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      };

      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    } catch {}
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {}
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
