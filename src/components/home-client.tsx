"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QuickLinks } from "@/components/quick-links";
import { Notepad } from "@/components/notepad";
import { News } from "@/components/news";
import { AdSlot } from "@/components/ad-slot";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_PREFS,
  feedsToQuery,
  loadPrefs,
  type Prefs,
} from "@/lib/prefs";
import {
  getAppearance,
  type Appearance,
  DEFAULT_APPEARANCE,
} from "@/lib/appearance";
import { Weather } from "@/components/weather";
import {
  GripVertical,
  Link2,
  Newspaper,
  NotebookPen,
  Search,
  CloudSun,
} from "lucide-react";

type TileId = "links" | "news" | "notes" | "weather";
type ColumnId = "left" | "center" | "right";
type Board = Record<ColumnId, TileId[]>;

const BOARD_KEY = "bdp:board:v1";

const DEFAULT_BOARD: Board = {
  left: ["news"],
  center: ["weather", "notes"],
  right: ["links"],
};

function normalizeBoard(b: Partial<Board> | null | undefined): Board {
  const allowed = new Set<TileId>(["links", "news", "notes", "weather"]);
  const out: Board = { left: [], center: [], right: [] };

  const src = b ?? {};
  for (const col of ["left", "center", "right"] as const) {
    const arr = Array.isArray((src as any)[col])
      ? ((src as any)[col] as string[])
      : [];
    out[col] = arr.filter((t) => allowed.has(t as TileId)) as TileId[];
  }

  // ensure each tile exists exactly once
  const all: TileId[] = ["news", "weather", "notes", "links"];
  const seen = new Set<TileId>();
  for (const col of ["left", "center", "right"] as const) {
    out[col] = out[col].filter((t) => {
      if (seen.has(t)) return false;
      seen.add(t);
      return true;
    });
  }
  for (const t of all) {
    if (!seen.has(t)) out.right.push(t);
  }

  return out;
}

function loadBoard(): Board {
  try {
    const raw = window.localStorage.getItem(BOARD_KEY);
    if (!raw) return DEFAULT_BOARD;
    return normalizeBoard(JSON.parse(raw));
  } catch {
    return DEFAULT_BOARD;
  }
}

function saveBoard(board: Board) {
  window.localStorage.setItem(BOARD_KEY, JSON.stringify(board));
}

function TileFrame({
  title,
  icon,
  children,
  dragHandleProps,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  dragHandleProps: React.ButtonHTMLAttributes<HTMLButtonElement>;
}) {
  return (
    <Card className="transition-all hover:-translate-y-[1px] hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {icon}
            {title}
          </CardTitle>

          <button
            type="button"
            className="flex items-center rounded-md px-1 py-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground cursor-grab active:cursor-grabbing"
            title="Drag to move"
            aria-label="Drag to move"
            {...dragHandleProps}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

export function HomeClient() {
  const [prefs, setPrefs] = React.useState<Prefs>(DEFAULT_PREFS);
  const [overId, setOverId] = React.useState<string | null>(null);
  const [appearance, setAppearanceState] =
    React.useState<Appearance>(DEFAULT_APPEARANCE);
  const [board, setBoard] = React.useState<Board>(DEFAULT_BOARD);
  const [dragging, setDragging] = React.useState<{
    tile: TileId;
    fromCol: ColumnId;
  } | null>(null);

  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
  function stop() {
    setDragging(null);
  }

  window.addEventListener("dragend", stop);
  window.addEventListener("drop", stop);
  window.addEventListener("blur", stop); // alt-tab / window loses focus

  return () => {
    window.removeEventListener("dragend", stop);
    window.removeEventListener("drop", stop);
    window.removeEventListener("blur", stop);
  };
}, []);

React.useEffect(() => {
  const t = window.setInterval(() => setNow(new Date()), 1000);
  return () => window.clearInterval(t);
}, []);

  React.useEffect(() => {
    setPrefs(loadPrefs());
    setAppearanceState(getAppearance());
    setBoard(loadBoard());

    function onStorage(e: StorageEvent) {
      if (e.key === "bdp:prefs:v1") setPrefs(loadPrefs());
      if (e.key === "bdp:appearance:v1") setAppearanceState(getAppearance());
      if (e.key === BOARD_KEY) setBoard(loadBoard());
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  React.useEffect(() => {
    saveBoard(board);
  }, [board]);

  const feeds = React.useMemo(() => feedsToQuery(prefs), [prefs]);

  const isPhoto = appearance.backgroundMode === "photo";
  const isGradient = appearance.backgroundMode === "gradient";

  const mainClass = isPhoto
    ? "min-h-screen text-foreground bg-cover bg-center"
    : isGradient
      ? "min-h-screen text-foreground bg-gradient-to-b from-muted/70 to-background"
      : "min-h-screen text-foreground bg-background";

  const overlayClass = isPhoto
  ? "min-h-screen bg-gradient-to-b from-background/55 via-background/25 to-background/55"
  : "min-h-screen";

  // Hide tiles when toggled off
  const enabled: Record<TileId, boolean> = {
    links: prefs.showLinks,
    news: prefs.showNews,
    notes: prefs.showNotes,
    weather: true,
  };

  function removeFromBoard(b: Board, tile: TileId): Board {
    const next = structuredClone(b) as Board;
    for (const col of ["left", "center", "right"] as const) {
      next[col] = next[col].filter((t) => t !== tile);
    }
    return next;
  }

  function insertIntoBoard(
    b: Board,
    col: ColumnId,
    tile: TileId,
    before?: TileId,
  ): Board {
    const next = removeFromBoard(b, tile);
    const arr = next[col].slice();
    if (before) {
      const idx = arr.indexOf(before);
      if (idx >= 0) arr.splice(idx, 0, tile);
      else arr.push(tile);
    } else {
      arr.push(tile);
    }
    next[col] = arr;
    return next;
  }

  function dragData(tile: TileId, fromCol: ColumnId) {
    return JSON.stringify({ tile, fromCol });
  }

  function parseDragData(
    dt: DataTransfer,
  ): { tile: TileId; fromCol: ColumnId } | null {
    try {
      const raw = dt.getData("application/x-bdp-board");
      if (!raw) return null;
      const j = JSON.parse(raw);
      if (!j?.tile || !j?.fromCol) return null;
      return { tile: j.tile as TileId, fromCol: j.fromCol as ColumnId };
    } catch {
      return null;
    }
  }

  function Column({
    id,
    title,
    children,
  }: {
    id: ColumnId;
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <div
        className="space-y-4"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
        onDrop={(e) => {
          e.preventDefault();
          const d = parseDragData(e.dataTransfer) ?? dragging;
          if (!d) return;
          setBoard((prev) => insertIntoBoard(prev, id, d.tile));
          setDragging(null);
        }}
      >
        <div className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </div>
        {children}
      </div>
    );
  }

  function renderTile(tile: TileId, col: ColumnId) {
    if (!enabled[tile]) return null;

    const dragHandleProps: React.ButtonHTMLAttributes<HTMLButtonElement> = {
      draggable: true,
      onDragStart: (e) => {
        setDragging({ tile, fromCol: col });
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("application/x-bdp-board", dragData(tile, col));
      },
      onDragEnd: () => setDragging(null),
    };

    const dropBeforeProps: React.HTMLAttributes<HTMLDivElement> = {
  onDragOver: (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverId(tile);
  },
  onDragLeave: () => setOverId(null),
  onDrop: (e) => {
    e.preventDefault();
    setOverId(null);
    const d = parseDragData(e.dataTransfer) ?? dragging;
    if (!d) return;
    setBoard((prev) => insertIntoBoard(prev, col, d.tile, tile));
    setDragging(null);
  },
};

    const wrapClass = overId === tile ? "ring-2 ring-primary/25 rounded-2xl" : "rounded-2xl";

    if (tile === "news") {
      return (
        <div key={tile} className={wrapClass} {...dropBeforeProps}>
          <TileFrame
            title="News"
            icon={<Newspaper className="h-4 w-4 text-muted-foreground" />}
            dragHandleProps={dragHandleProps}
          >
            <News feeds={feeds} />
          </TileFrame>
        </div>
      );
    }

    if (tile === "weather") {
      return (
        <div key={tile} className={wrapClass} {...dropBeforeProps}>
          <TileFrame
            title="Weather"
            icon={<CloudSun className="h-4 w-4 text-muted-foreground" />}
            dragHandleProps={dragHandleProps}
          >
            <Weather />
          </TileFrame>
        </div>
      );
    }

    if (tile === "notes") {
      return (
        <div key={tile} className={wrapClass} {...dropBeforeProps}>
          <TileFrame
            title="Notepad"
            icon={<NotebookPen className="h-4 w-4 text-muted-foreground" />}
            dragHandleProps={dragHandleProps}
          >
            <Notepad />
          </TileFrame>
        </div>
      );
    }

    return (
      <div key={tile} className={wrapClass} {...dropBeforeProps}>
        <TileFrame
          title="Quick Links"
          icon={<Link2 className="h-4 w-4 text-muted-foreground" />}
          dragHandleProps={dragHandleProps}
        >
          <QuickLinks />
        </TileFrame>
      </div>
    );
  }

  return (
    <main
      className={mainClass}
      style={
        isPhoto
          ? {
              backgroundImage: `url(${appearance.backgroundUrl})`,
            }
          : undefined
      }
    >
      <div className={overlayClass}>
        {/* top row */}
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-4">
          <div className="text-sm font-semibold">
            <span className="text-primary">Better</span>{" "}
            <span className="text-muted-foreground">DefaultPage</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/start"
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              title="Set as your browser homepage / new tab"
            >
              Set default
            </a>
            <Button asChild variant="ghost" size="icon">
              <a href="/settings" aria-label="Settings" title="Settings">
                {/* tiny gear svg to avoid extra imports */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
                  <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .31 1.7 1.7 0 0 0-.65 1.46V21a2 2 0 0 1-4 0v-.08A1.7 1.7 0 0 0 8.4 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.31-1 1.7 1.7 0 0 0-1.46-.65H2a2 2 0 0 1 0-4h.08A1.7 1.7 0 0 0 4.6 8.4a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.7 1.7 0 0 0 8.4 4.6c.3-.2.65-.3 1-.31A1.7 1.7 0 0 0 10.06 2.8V2a2 2 0 0 1 4 0v.08A1.7 1.7 0 0 0 15.6 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.7 1.7 0 0 0 19.4 8.4c.2.3.3.65.31 1A1.7 1.7 0 0 0 21.2 10.06H22a2 2 0 0 1 0 4h-.08A1.7 1.7 0 0 0 19.4 15Z" />
                </svg>
              </a>
            </Button>
          </div>
        </div>

        {/* centered search */}
        <section className="mx-auto max-w-3xl px-4 pt-10">
          <div className="flex flex-col items-center text-center">
  <div className="text-5xl font-semibold tabular-nums tracking-tight">
    {now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
  </div>
  <div className="mt-2 text-sm text-muted-foreground">
    {now.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    })}
  </div>
</div>
          <form
            action="https://www.google.com/search"
            method="GET"
            className="mt-6"
          >
            <div className="relative">
              <button
                type="submit"
                className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <Input
                name="q"
                placeholder="Search Google…"
                className="h-12 rounded-full pl-12 pr-5 text-base shadow-sm focus-visible:ring-2 bg-background/85"
                autoComplete="off"
              />
            </div>
          </form>
          <div className="mt-3 text-xs text-muted-foreground text-center">
            Drag tiles by the grip to move between columns.
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 pt-6">
          <AdSlot id="ad-top" />
        </div>

        {/* board */}
        <section className="mx-auto max-w-6xl px-4 py-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="md:col-span-4">
              <Column id="left" title="Left">
                {board.left.map((t) => renderTile(t, "left"))}
              </Column>
            </div>

            <div className="md:col-span-4">
              <Column id="center" title="Center">
                {board.center.map((t) => renderTile(t, "center"))}
              </Column>
            </div>

            <div className="md:col-span-4">
              <Column id="right" title="Right">
                {board.right.map((t) => renderTile(t, "right"))}
              </Column>
            </div>
          </div>
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
      </div>
    </main>
  );
}
