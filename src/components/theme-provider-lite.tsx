"use client";

import * as React from "react";
import { getTheme } from "@/lib/theme";

function apply(mode: "system" | "light" | "dark") {
  const root = document.documentElement;
  const systemDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const dark = mode === "dark" || (mode === "system" && systemDark);
  root.classList.toggle("dark", dark);
}

function applyAccent(accent: "blue" | "green" | "purple") {
  // Set CSS vars directly (oklch values)
  const root = document.documentElement;
  const map = {
    blue: { p: "oklch(0.62 0.18 250)", pf: "oklch(0.985 0 0)" },
    green: { p: "oklch(0.70 0.17 155)", pf: "oklch(0.145 0 0)" },
    purple: { p: "oklch(0.62 0.20 300)", pf: "oklch(0.985 0 0)" },
  } as const;
  root.style.setProperty("--primary", map[accent].p);
  root.style.setProperty("--primary-foreground", map[accent].pf);
}

export function ThemeProviderLite({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const t = getTheme();

    apply(t.mode);
    applyAccent(t.accent);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const latest = getTheme();
      apply(latest.mode);
    };
    mq?.addEventListener?.("change", onChange);
    return () => mq?.removeEventListener?.("change", onChange);
  }, []);

  return <>{children}</>;
}