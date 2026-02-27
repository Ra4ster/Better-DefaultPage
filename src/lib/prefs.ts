import { lsGet, lsSet } from "@/lib/storage";

export type Prefs = {
  showLinks: boolean;
  showNews: boolean;
  showNotes: boolean;
  feeds: { hn: boolean; npr: boolean; verge: boolean };
};

export const PREFS_KEY = "bdp:prefs:v1";

export const DEFAULT_PREFS: Prefs = {
  showLinks: true,
  showNews: true,
  showNotes: true,
  feeds: { hn: true, npr: true, verge: true },
};

export function loadPrefs(): Prefs {
  return lsGet(PREFS_KEY, DEFAULT_PREFS);
}

export function savePrefs(prefs: Prefs) {
  lsSet(PREFS_KEY, prefs);
}

export function feedsToQuery(prefs: Prefs) {
  const keys: string[] = [];
  if (prefs.feeds.hn) keys.push("hn");
  if (prefs.feeds.npr) keys.push("npr");
  if (prefs.feeds.verge) keys.push("verge");
  return keys.join(",");
}