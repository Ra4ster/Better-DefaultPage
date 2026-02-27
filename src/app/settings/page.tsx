"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { lsGet, lsSet } from "@/lib/storage";
import {
  getAppearance,
  setAppearance,
  DEFAULT_APPEARANCE,
  type Appearance,
  type ThemeMode,
  type Accent,
  type BackgroundMode,
} from "@/lib/appearance";

type Prefs = {
  showLinks: boolean;
  showNews: boolean;
  showNotes: boolean;
  feeds: { hn: boolean; npr: boolean; verge: boolean };
};

const PREFS_KEY = "bdp:prefs:v1";
const DEFAULT_PREFS: Prefs = {
  showLinks: true,
  showNews: true,
  showNotes: true,
  feeds: { hn: true, npr: true, verge: true },
};

const ACCENT_MAP: Record<Accent, { p: string; pf: string }> = {
  blue: { p: "oklch(0.62 0.18 250)", pf: "oklch(0.985 0 0)" },
  green: { p: "oklch(0.70 0.17 155)", pf: "oklch(0.145 0 0)" },
  purple: { p: "oklch(0.62 0.20 300)", pf: "oklch(0.985 0 0)" },
  orange: { p: "oklch(0.72 0.19 60)", pf: "oklch(0.145 0 0)" },
  rose: { p: "oklch(0.64 0.21 10)", pf: "oklch(0.985 0 0)" },
};

const BACKGROUNDS: string[] = [
  "https://images.unsplash.com/photo-1592490930930-e5fc1b9fd2db?auto=format&fit=crop&w=2400&q=70",
  "https://images.unsplash.com/photo-1608557204482-92f2424cd001?auto=format&fit=crop&w=2400&q=70",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2400&q=70",
  "https://images.unsplash.com/photo-1523477593243-78bbf626fd3b?auto=format&fit=crop&w=2400&q=70",
  "https://images.unsplash.com/photo-1545159639-3f3534aa074e?auto=format&fit=crop&w=2400&q=70",
  "https://images.unsplash.com/photo-1520682359118-11358394caec?auto=format&fit=crop&w=2400&q=70",
];

function applyAppearanceToDom(next: Appearance) {
  // theme
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = next.mode === "dark" || (next.mode === "system" && systemDark);
  document.documentElement.classList.toggle("dark", dark);

  // accent
  const a = ACCENT_MAP[next.accent] ?? ACCENT_MAP.blue;
  document.documentElement.style.setProperty("--primary", a.p);
  document.documentElement.style.setProperty("--primary-foreground", a.pf);
}

export default function SettingsPage() {
  const [prefs, setPrefsState] = React.useState<Prefs>(DEFAULT_PREFS);
  const [appearance, setAppearanceState] =
    React.useState<Appearance>(DEFAULT_APPEARANCE);
  const [mounted, setMounted] = React.useState(false);

  // Load from localStorage after mount to avoid hydration mismatches.
  React.useEffect(() => {
    setPrefsState(lsGet(PREFS_KEY, DEFAULT_PREFS));
    setAppearanceState(getAppearance());
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    lsSet(PREFS_KEY, prefs);
  }, [prefs, mounted]);

  function updateAppearance(next: Appearance) {
    setAppearance(next);
    setAppearanceState(next);
    applyAppearanceToDom(next);
  }

  function resetAll() {
    // reset prefs
    lsSet(PREFS_KEY, DEFAULT_PREFS);
    setPrefsState(DEFAULT_PREFS);

    // reset appearance
    setAppearance(DEFAULT_APPEARANCE);
    setAppearanceState(DEFAULT_APPEARANCE);
    applyAppearanceToDom(DEFAULT_APPEARANCE);

    // clear content
    window.localStorage.removeItem("bdp:notepad:v1");
    window.localStorage.removeItem("bdp:quicklinks:v1");
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

      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        {/* Appearance */}
        {mounted && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Theme */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Theme</div>
                <div className="flex gap-2">
                  {(["system", "light", "dark"] as ThemeMode[]).map((mode) => (
                    <Button
                      key={mode}
                      size="sm"
                      variant={appearance.mode === mode ? "default" : "outline"}
                      onClick={() => updateAppearance({ ...appearance, mode })}
                    >
                      {mode}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Accent */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Accent</div>
                <div className="flex gap-2">
                  {(
                    [
                      { key: "blue", cls: "bg-blue-500" },
                      { key: "green", cls: "bg-emerald-500" },
                      { key: "purple", cls: "bg-violet-500" },
                      { key: "orange", cls: "bg-orange-500" },
                      { key: "rose", cls: "bg-rose-500" },
                    ] as { key: Accent; cls: string }[]
                  ).map((a) => (
                    <button
                      key={a.key}
                      type="button"
                      onClick={() =>
                        updateAppearance({ ...appearance, accent: a.key })
                      }
                      className={[
                        "h-8 w-8 rounded-full border transition",
                        a.cls,
                        appearance.accent === a.key
                          ? "ring-2 ring-ring ring-offset-2 ring-offset-background"
                          : "opacity-90 hover:opacity-100",
                      ].join(" ")}
                      aria-label={`Accent ${a.key}`}
                      title={a.key}
                    />
                  ))}
                </div>
              </div>

              {/* Background mode */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Background</div>
                <div className="flex gap-2">
                  {(["none", "gradient", "photo"] as BackgroundMode[]).map(
                    (bg) => (
                      <Button
                        key={bg}
                        size="sm"
                        variant={
                          appearance.backgroundMode === bg
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          updateAppearance({ ...appearance, backgroundMode: bg })
                        }
                      >
                        {bg}
                      </Button>
                    )
                  )}
                </div>
              </div>

              {/* Background picker */}
              {appearance.backgroundMode === "photo" && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Background image</div>

                  <div className="grid grid-cols-3 gap-2">
                    {BACKGROUNDS.map((url) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() =>
                          updateAppearance({ ...appearance, backgroundUrl: url })
                        }
                        className={[
                          "relative overflow-hidden rounded-lg border",
                          appearance.backgroundUrl === url
                            ? "ring-2 ring-ring ring-offset-2 ring-offset-background"
                            : "hover:opacity-95",
                        ].join(" ")}
                        title="Choose background"
                      >
                        <img
                          src={url}
                          alt=""
                          className="h-16 w-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Tip: pick “gradient” if you want maximum readability.
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Changes apply instantly and are saved.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modules */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Modules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row
              label="Quick Links"
              value={prefs.showLinks}
              onChange={(v) => setPrefsState((p) => ({ ...p, showLinks: v }))}
            />
            <Row
              label="News"
              value={prefs.showNews}
              onChange={(v) => setPrefsState((p) => ({ ...p, showNews: v }))}
            />
            <Row
              label="Notepad"
              value={prefs.showNotes}
              onChange={(v) => setPrefsState((p) => ({ ...p, showNotes: v }))}
            />
          </CardContent>
        </Card>

        {/* News Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">News Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row
              label="Hacker News"
              value={prefs.feeds.hn}
              onChange={(v) =>
                setPrefsState((p) => ({ ...p, feeds: { ...p.feeds, hn: v } }))
              }
            />
            <Row
              label="NPR"
              value={prefs.feeds.npr}
              onChange={(v) =>
                setPrefsState((p) => ({ ...p, feeds: { ...p.feeds, npr: v } }))
              }
            />
            <Row
              label="The Verge"
              value={prefs.feeds.verge}
              onChange={(v) =>
                setPrefsState((p) => ({
                  ...p,
                  feeds: { ...p.feeds, verge: v },
                }))
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