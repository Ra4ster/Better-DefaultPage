"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QuickLinks } from "@/components/quick-links";
import { Notepad } from "@/components/notepad";
import { News } from "@/components/news";
import { AdSlot } from "@/components/ad-slot";
import { DEFAULT_PREFS, feedsToQuery, loadPrefs, Prefs } from "@/lib/prefs";

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
    <main className="min-h-screen bg-muted/30 text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <div className="font-semibold">
            <span className="text-primary">Better</span>{" "}
            <span className="text-muted-foreground">DefaultPage</span>
          </div>

          <div className="flex-1">
            <form action="https://www.google.com/search" method="GET" className="w-full">
              <Input name="q" placeholder="Search Google…" autoComplete="off" />
            </form>
          </div>

          <a href="/start" className="text-sm text-primary underline underline-offset-4">
            Set as default
          </a>
          <a href="/settings" className="text-sm text-primary underline underline-offset-4">
            Settings
          </a>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <AdSlot id="ad-top" />
      </div>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-6 md:grid-cols-12">
        {prefs.showLinks && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="text-base">Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickLinks />
            </CardContent>
          </Card>
        )}

        {prefs.showNews && (
          <Card className="md:col-span-6">
            <CardHeader>
              <CardTitle className="text-base">News</CardTitle>
            </CardHeader>
            <CardContent>
              <News feeds={feeds} />
            </CardContent>
          </Card>
        )}

        {prefs.showNotes && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="text-base">Notepad</CardTitle>
            </CardHeader>
            <CardContent>
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
          <a className="underline underline-offset-4" href="/privacy">Privacy</a>
          <a className="underline underline-offset-4" href="/terms">Terms</a>
          <a className="underline underline-offset-4" href="/contact">Contact</a>
        </div>
      </footer>
    </main>
  );
}