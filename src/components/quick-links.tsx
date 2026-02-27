"use client";

import * as React from "react";
import { lsGet, lsSet } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LinkItem = { title: string; url: string };
const KEY = "bdp:quicklinks:v1";

function normalizeUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function QuickLinks() {
  const [items, setItems] = React.useState<LinkItem[]>([]);
  const [title, setTitle] = React.useState("");
  const [url, setUrl] = React.useState("");

  React.useEffect(() => {
    setItems(lsGet<LinkItem[]>(KEY, []));
  }, []);

  React.useEffect(() => {
    lsSet(KEY, items);
  }, [items]);

  function add() {
    const t = title.trim();
    const u = normalizeUrl(url);
    if (!t || !u) return;
    setItems((prev) => [{ title: t, url: u }, ...prev].slice(0, 12));
    setTitle("");
    setUrl("");
  }

  function remove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (e.g., Gmail)"
        />
        <div className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL (e.g., gmail.com)"
          />
          <Button type="button" onClick={add}>
            Add
          </Button>
        </div>
      </div>

      <div className="grid gap-2">
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Add your most-used links.
          </div>
        ) : (
          items.map((it, idx) => (
            <div
              key={`${it.title}-${it.url}-${idx}`}
              className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
            >
              <a
                href={it.url}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex-1 truncate underline underline-offset-4"
                title={it.url}
              >
                {it.title}
              </a>
              <button
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => remove(idx)}
                aria-label={`Remove ${it.title}`}
                type="button"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}