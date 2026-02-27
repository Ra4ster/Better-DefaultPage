"use client";

import * as React from "react";
import { getTheme, setTheme, type ThemeMode, type Accent } from "@/lib/theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { lsGet, lsSet } from "@/lib/storage";

type Prefs = {
  showLinks: boolean;
  showNews: boolean;
  showNotes: boolean;
  feeds: { hn: boolean; npr: boolean; verge: boolean };
};

const KEY = "bdp:prefs:v1";
const DEFAULT_PREFS: Prefs = {
  showLinks: true,
  showNews: true,
  showNotes: true,
  feeds: { hn: true, npr: true, verge: true },
};

export default function SettingsPage() {
  const [prefs, setPrefs] = React.useState<Prefs>(DEFAULT_PREFS);
  const [theme, setThemeState] = React.useState(() => getTheme());
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
  setThemeState(getTheme());
  setMounted(true);
}, []);

  function updateTheme(next: { mode: ThemeMode; accent: Accent }) {
    setTheme(next);
    setThemeState(next);
    // apply immediately without refresh
    document.documentElement.classList.toggle(
      "dark",
      next.mode === "dark" ||
        (next.mode === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches),
    );
    // accent vars
    const map = {
      blue: { p: "oklch(0.62 0.18 250)", pf: "oklch(0.985 0 0)" },
      green: { p: "oklch(0.70 0.17 155)", pf: "oklch(0.145 0 0)" },
      purple: { p: "oklch(0.62 0.20 300)", pf: "oklch(0.985 0 0)" },
    } as const;
    document.documentElement.style.setProperty("--primary", map[next.accent].p);
    document.documentElement.style.setProperty(
      "--primary-foreground",
      map[next.accent].pf,
    );
  }

  React.useEffect(() => {
    setPrefs(lsGet(KEY, DEFAULT_PREFS));
  }, []);

  React.useEffect(() => {
    lsSet(KEY, prefs);
  }, [prefs]);

  function resetAll() {
    lsSet(KEY, DEFAULT_PREFS);
    // also clear notepad + quicklinks (your existing keys)
    window.localStorage.removeItem("bdp:notepad:v1");
    window.localStorage.removeItem("bdp:quicklinks:v1");
    setPrefs(DEFAULT_PREFS);
  }

  function clearNotepad() {
    window.localStorage.removeItem("bdp:notepad:v1");
  }

  return (
    <main className="min-h-screen bg-muted/30 text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="font-semibold">
            <span className="text-primary">Better</span>{" "}
            <span className="text-muted-foreground">DefaultPage</span>
          </div>
          <a
            href="/"
            className="text-sm text-primary underline underline-offset-4"
          >
            Back
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      {mounted && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Theme</div>
              <div className="flex gap-2">
                {(["system", "light", "dark"] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={theme.mode === mode ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateTheme({ ...theme, mode })}
                  >
                    {mode}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Accent</div>
              <div className="flex gap-2">
                {(["blue", "green", "purple"] as const).map((accent) => (
                  <Button
                    key={accent}
                    variant={theme.accent === accent ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateTheme({ ...theme, accent })}
                  >
                    {accent}
                  </Button>
                ))}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Changes apply instantly and are saved.
            </div>
          </CardContent>
        </Card>
      )}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Modules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row
              label="Quick Links"
              value={prefs.showLinks}
              onChange={(v) => setPrefs((p) => ({ ...p, showLinks: v }))}
            />
            <Row
              label="News"
              value={prefs.showNews}
              onChange={(v) => setPrefs((p) => ({ ...p, showNews: v }))}
            />
            <Row
              label="Notepad"
              value={prefs.showNotes}
              onChange={(v) => setPrefs((p) => ({ ...p, showNotes: v }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">News Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row
              label="Hacker News"
              value={prefs.feeds.hn}
              onChange={(v) =>
                setPrefs((p) => ({ ...p, feeds: { ...p.feeds, hn: v } }))
              }
            />
            <Row
              label="NPR"
              value={prefs.feeds.npr}
              onChange={(v) =>
                setPrefs((p) => ({ ...p, feeds: { ...p.feeds, npr: v } }))
              }
            />
            <Row
              label="The Verge"
              value={prefs.feeds.verge}
              onChange={(v) =>
                setPrefs((p) => ({ ...p, feeds: { ...p.feeds, verge: v } }))
              }
            />

            <Separator />

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={clearNotepad}>
                Clear notepad
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetAll}
                className="text-destructive border-destructive hover:bg-destructive/10"
              >
                Reset everything
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              Changes save automatically.
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm">{label}</div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}
