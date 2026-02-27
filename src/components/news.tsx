"use client";

import * as React from "react";

type NewsItem = {
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
};

function minutesAgo(d: Date) {
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins <= 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
}

export function News({ feeds }: { feeds: string }) {
  const [items, setItems] = React.useState<NewsItem[] | null>(null);
  const [updatedAt, setUpdatedAt] = React.useState<Date | null>(null);

  async function load() {
    try {
      const res = await fetch(
        `/api/news?feeds=${encodeURIComponent(feeds)}`,
        { cache: "no-store" }
      );
      const data = (await res.json()) as { items: NewsItem[] };
      setItems(data.items ?? []);
      setUpdatedAt(new Date());
    } catch {
      setItems([]);
      setUpdatedAt(new Date());
    }
  }

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!cancelled) await load();
    })();

    // Auto-refresh every 10 minutes (matches server revalidate)
    const t = window.setInterval(() => {
      if (!cancelled) load();
    }, 10 * 60 * 1000);

    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeds]);

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
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {updatedAt ? `Updated ${minutesAgo(updatedAt)}` : ""}
        </div>
        <button
          type="button"
          onClick={load}
          className="text-xs text-primary underline underline-offset-4"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-1">
        {items.slice(0, 10).map((it, idx) => {
          let host = "";
          try {
            host = new URL(it.url).hostname;
          } catch {
            host = "";
          }

          return (
            <a
              key={`${it.url}-${idx}`}
              href={it.url}
              target="_blank"
              rel="noreferrer"
              className="group flex gap-3 rounded-xl px-3 py-2 hover:bg-muted/50 transition"
              title={it.url}
            >
              <img
                src={
                  host
                    ? `https://www.google.com/s2/favicons?sz=64&domain=${host}`
                    : ""
                }
                alt=""
                className="mt-0.5 h-6 w-6 rounded"
                loading="lazy"
              />

              <div className="min-w-0">
                <div className="text-sm font-medium leading-snug text-foreground group-hover:text-primary">
                  {it.title}
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  {it.source}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}