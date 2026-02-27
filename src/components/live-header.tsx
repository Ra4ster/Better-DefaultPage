"use client";

import * as React from "react";

function getGreeting(h: number) {
  if (h < 5) return "Good night.";
  if (h < 12) return "Good morning.";
  if (h < 18) return "Good afternoon.";
  return "Good evening.";
}

export function LiveHeader() {
  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const h = now.getHours();

  return (
    <div className="flex items-center gap-3">
  <div className="relative">
    <span className="absolute -inset-1 rounded-full bg-primary/20 blur-sm animate-pulse" />
    <span className="relative block h-2 w-2 rounded-full bg-primary" />
  </div>

  <div>
    <div className="text-lg font-semibold text-primary">
      {getGreeting(h)}
    </div>
    <div className="text-sm text-muted-foreground">
      {now.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })} ·{" "}
      {now.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })}
    </div>
  </div>
</div>
  );
}