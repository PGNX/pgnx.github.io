"use client";

import { useSyncExternalStore } from "react";

/** Application status a student can set on a saved programme. Order = pipeline order. */
export const STATUSES = [
  { id: "interested", label: "Interested", tone: "neutral" },
  { id: "preparing", label: "Preparing documents", tone: "neutral" },
  { id: "applied", label: "Applied", tone: "info" },
  { id: "uni-assist", label: "At uni-assist (VPD pending)", tone: "info" },
  { id: "forwarded", label: "Forwarded to university", tone: "info" },
  { id: "admitted", label: "Admitted 🎉", tone: "good" },
  { id: "declined", label: "Declined", tone: "bad" },
  { id: "withdrawn", label: "Withdrawn / not applying", tone: "muted" },
] as const;
export type StatusId = (typeof STATUSES)[number]["id"];

export interface SavedItem { savedAt: string; status: StatusId; note: string }
export type Shortlist = Record<string, SavedItem>; // key = programme slug

const KEY = "pgnx.shortlist.v1";
const EMPTY: Shortlist = {};
let cache: Shortlist | null = null;
const listeners = new Set<() => void>();

function read(): Shortlist {
  if (cache) return cache;
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
    cache = raw ? (JSON.parse(raw) as Shortlist) : {};
  } catch { cache = {}; }
  return cache;
}
function write(next: Shortlist) {
  cache = next;
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode etc. */ }
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) { cache = null; l(); } };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(l); window.removeEventListener("storage", onStorage); };
}

/** Reactive shortlist. Server render sees an empty list, the browser fills it in after hydration. */
export function useShortlist(): Shortlist {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export const shortlist = {
  has: (slug: string) => Boolean(read()[slug]),
  add(slug: string) { if (!read()[slug]) write({ ...read(), [slug]: { savedAt: new Date().toISOString(), status: "interested", note: "" } }); },
  remove(slug: string) { const n = { ...read() }; delete n[slug]; write(n); },
  toggle(slug: string) { if (read()[slug]) shortlist.remove(slug); else shortlist.add(slug); },
  setStatus(slug: string, status: StatusId) { const cur = read()[slug]; if (cur) write({ ...read(), [slug]: { ...cur, status } }); },
  setNote(slug: string, note: string) { const cur = read()[slug]; if (cur) write({ ...read(), [slug]: { ...cur, note } }); },
  clear() { write({}); },
  /** Merge slugs from a share link; returns how many were new. */
  importSlugs(slugs: string[]) {
    const cur = read(); const next = { ...cur }; let added = 0;
    for (const s of slugs) if (s && !next[s]) { next[s] = { savedAt: new Date().toISOString(), status: "interested", note: "" }; added++; }
    if (added) write(next);
    return added;
  },
};
