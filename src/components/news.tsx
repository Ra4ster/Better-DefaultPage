"use client";

import * as React from "react";

type NewsItem = {
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
};

export function News({ feeds } : { feeds: string }) {
  const [items, setItems] = React.useState<NewsItem[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/news?feeds=${encodeURIComponent(feeds)}`, { cache: "no-store" });
        const data = (await res.json()) as { items: NewsItem[] };
        if (!cancelled) setItems(data.items ?? []);
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
    <div className="space-y-3">
      {items.slice(0, 10).map((it, idx) => (
        <div key={`${it.url}-${idx}`} className="space-y-1">
          <a
            href={it.url}
            target="_blank"
            rel="noreferrer"
            className="block text-sm text-primary underline underline-offset-4"
            title={it.url}
          >
            {it.title}
          </a>
          <div className="text-xs text-muted-foreground">{it.source}</div>
        </div>
      ))}
    </div>
  );
}