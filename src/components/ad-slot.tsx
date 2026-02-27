"use client";

export function AdSlot({ id }: { id: string }) {
  // Don’t show ads in dev to avoid layout/debug pain.
  if (process.env.NODE_ENV !== "production") return null;

  // Placeholder container. We'll wire AdSense after approval.
  return (
    <div
      id={id}
      className="w-full min-h-[90px] rounded-md border bg-background/50"
      aria-label="Advertisement"
    />
  );
}