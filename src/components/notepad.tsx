"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { lsGet, lsSet } from "@/lib/storage";

const KEY = "bdp:notepad:v1";

export function Notepad() {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    setValue(lsGet(KEY, ""));
  }, []);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      lsSet(KEY, value);
    }, 250);
    return () => window.clearTimeout(t);
  }, [value]);

  return (
    <Textarea
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Notes… (autosaves)"
      className="min-h-[220px] resize-none"
    />
  );
}