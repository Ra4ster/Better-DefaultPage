import { lsGet, lsSet } from "@/lib/storage";

export type ThemeMode = "system" | "light" | "dark";
export type Accent = "blue" | "green" | "purple" | "orange" | "rose";
export type BackgroundMode = "none" | "gradient" | "photo";

export type Appearance = {
  mode: ThemeMode;
  accent: Accent;
  backgroundMode: BackgroundMode;
  backgroundUrl: string; // used when backgroundMode === "photo"
};

export const APPEARANCE_KEY = "bdp:appearance:v1";

export const DEFAULT_APPEARANCE: Appearance = {
  mode: "system",
  accent: "blue",
  backgroundMode: "gradient",
  backgroundUrl:
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=3000&q=70",
};

export function getAppearance(): Appearance {
  return lsGet(APPEARANCE_KEY, DEFAULT_APPEARANCE);
}

export function setAppearance(v: Appearance) {
  lsSet(APPEARANCE_KEY, v);
}