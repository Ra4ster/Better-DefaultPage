"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LiveHeader } from "@/components/live-header";
import { QuickLinks } from "@/components/quick-links";
import { Notepad } from "@/components/notepad";
import { News } from "@/components/news";
import { AdSlot } from "@/components/ad-slot";
import { Button } from "@/components/ui/button";
import { DEFAULT_PREFS, feedsToQuery, loadPrefs, Prefs } from "@/lib/prefs";
import { Link2, Newspaper, NotebookPen, Search } from "lucide-react";

export function HomeClient() {
  const [prefs, setPrefs] = React.useState<Prefs>(DEFAULT_PREFS);

  React.useEffect(() => {
    setPrefs(loadPrefs());
    // keep in sync if user has two tabs open
    function onStorage(e: StorageEvent) {
      if (e.key === "bdp:prefs:v1") setPrefs(loadPrefs());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const feeds = feedsToQuery(prefs);

  return (
    <main className="min-h-screen bg-muted/40 text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
          <div className="font-semibold">
            <span className="text-primary">Better</span>{" "}
            <span className="text-muted-foreground">DefaultPage</span>
          </div>

          <div className="flex-1">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search Google…"
                className="h-11 rounded-full pl-11 pr-5 text-base shadow-sm focus-visible:ring-2"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <a href="/start">Set as default</a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="/settings">Settings</a>
            </Button>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-4 pt-6">
        <div className="rounded-2xl border bg-background/80 p-5 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <LiveHeader />
            <div className="text-sm text-muted-foreground">
              Your links, headlines, and notes—ready when you are.
            </div>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <AdSlot id="ad-top" />
      </div>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-6 md:grid-cols-12">
        {prefs.showLinks && (
          <Card className="md:col-span-3 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <QuickLinks />
            </CardContent>
          </Card>
        )}

        {prefs.showNews && (
          <Card className="md:col-span-6 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-muted-foreground" />
                News
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <News feeds={feeds} />
            </CardContent>
          </Card>
        )}

        {prefs.showNotes && (
          <Card className="md:col-span-3 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <NotebookPen className="h-4 w-4 text-muted-foreground" />
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Notepad />
            </CardContent>
          </Card>
        )}
      </section>
      <div className="mx-auto max-w-6xl px-4 pb-6">
        <AdSlot id="ad-bottom" />
      </div>
      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <a className="underline underline-offset-4" href="/privacy">
            Privacy
          </a>
          <a className="underline underline-offset-4" href="/terms">
            Terms
          </a>
          <a className="underline underline-offset-4" href="/contact">
            Contact
          </a>
        </div>
      </footer>
    </main>
  );
}
