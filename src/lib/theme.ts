import { lsGet, lsSet } from "@/lib/storage";

export type ThemeMode = "system" | "light" | "dark";
export type Accent = "blue" | "green" | "purple";

const KEY = "bdp:theme:v1";

export function getTheme() {
  return lsGet(KEY, { mode: "system" as ThemeMode, accent: "blue" as Accent });
}

export function setTheme(v: { mode: ThemeMode; accent: Accent }) {
  lsSet(KEY, v);
}