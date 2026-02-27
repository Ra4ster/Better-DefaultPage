"use client";

import * as React from "react";

type NewsItem = {
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
};

export function News({ feeds }: { feeds: string }) {
  const [items, setItems] = React.useState<NewsItem[] | null>(null);
  const [updatedAt, setUpdatedAt] = React.useState<Date | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(
          `/api/news?feeds=${encodeURIComponent(feeds)}`,
          { cache: "no-store" },
        );
        const data = (await res.json()) as { items: NewsItem[] };
        if (!cancelled) setItems(data.items ?? []);

        setUpdatedAt(new Date());
      } catch {
        if (!cancelled) setItems([]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (items === null) {
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Couldn’t load headlines right now.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {updatedAt && (
        <div className="text-xs text-muted-foreground">
          Updated{" "}
          {Math.max(1, Math.round((Date.now() - updatedAt.getTime()) / 60000))}{" "}
          min ago
        </div>
      )}
      {items.slice(0, 10).map((it, idx) => (
        <a
          key={`${it.url}-${idx}`}
          href={it.url}
          target="_blank"
          rel="noreferrer"
          className="group flex gap-3 rounded-xl px-3 py-2 hover:bg-muted/50 transition"
        >
          <img
            src={`https://www.google.com/s2/favicons?sz=64&domain=${new URL(it.url).hostname}`}
            alt=""
            className="h-6 w-6 rounded"
            loading="lazy"
          />

          <div className="min-w-0">
            <div className="text-sm font-medium leading-snug group-hover:text-primary">
              {it.title}
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              {it.source}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
