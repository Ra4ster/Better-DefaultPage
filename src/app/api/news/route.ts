import { NextResponse } from "next/server";

type NewsItem = {
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
};

const ALL_FEEDS: { key: "hn" | "npr" | "verge"; source: string; url: string }[] = [
  { key: "hn", source: "Hacker News", url: "https://news.ycombinator.com/rss" },
  { key: "npr", source: "NPR", url: "https://feeds.npr.org/1001/rss.xml" },
  { key: "verge", source: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
];

function decodeXmlEntities(s: string) {
  const basic = s
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");

  return basic.replace(/&#(x?[0-9a-fA-F]+);/g, (_, code) => {
    try {
      const n =
        typeof code === "string" && code.startsWith("x")
          ? parseInt(code.slice(1), 16)
          : parseInt(code, 10);
      if (!Number.isFinite(n)) return _;
      return String.fromCodePoint(n);
    } catch {
      return _;
    }
  });
}

function stripCdata(s: string) {
  return s.replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, "$1");
}

function firstMatch(xml: string, re: RegExp) {
  const m = re.exec(xml);
  return m?.[1]?.trim();
}

function parseRss(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  const parts = xml.split(/<item[\s>]/i).slice(1);

  for (const p of parts) {
    const block = "<item " + p; // dummy prefix to keep regex happy
    const titleRaw =
      firstMatch(block, /<title>([\s\S]*?)<\/title>/i) ?? "";
    const linkRaw =
      firstMatch(block, /<link>([\s\S]*?)<\/link>/i) ??
      firstMatch(block, /<link[^>]*>([\s\S]*?)<\/link>/i) ??
      "";
    const dateRaw =
      firstMatch(block, /<pubDate>([\s\S]*?)<\/pubDate>/i) ??
      firstMatch(block, /<dc:date>([\s\S]*?)<\/dc:date>/i);

    const title = decodeXmlEntities(stripCdata(titleRaw)).trim();
    const url = decodeXmlEntities(stripCdata(linkRaw)).trim();

    if (!title || !url) continue;

    items.push({
      title,
      url,
      source,
      publishedAt: dateRaw ? dateRaw.trim() : undefined,
    });

    if (items.length >= 12) break;
  }

  return items;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const enabled = new Set(
      (searchParams.get("feeds") ?? "hn,npr,verge")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    );

    const FEEDS = ALL_FEEDS.filter((f) => enabled.has(f.key));
    if (FEEDS.length === 0) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }
    const results = await Promise.all(
      FEEDS.map(async (f) => {
        const res = await fetch(f.url, {
          // 10 minute cache in Next.js
          next: { revalidate: 600 },
          headers: {
            "User-Agent":
              "BetterDefaultPage/1.0 (+https://example.com) Next.js fetch",
          },
        });
        if (!res.ok) return [] as NewsItem[];
        const xml = await res.text();
        return parseRss(xml, f.source);
      })
    );

    const merged = results
      .flat()
      .slice(0, 30);

    // Light de-dupe by URL
    const seen = new Set<string>();
    const items: NewsItem[] = [];
    for (const it of merged) {
      if (seen.has(it.url)) continue;
      seen.add(it.url);
      items.push(it);
      if (items.length >= 18) break;
    }

    return NextResponse.json(
      { items },
      {
        headers: {
          // CDN/browser cache; still respects revalidate above
          "Cache-Control": "public, max-age=600, stale-while-revalidate=600",
        },
      }
    );
  } catch (err) {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}