"use client";

import { useEffect, useState } from "react";
import type { ProgrammeIndex } from "./filters";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
export type Index = { builtAt: string; programmes: ProgrammeIndex[] };
let cached: Index | null = null;
let pending: Promise<Index> | null = null;

/** Loads public/data/programs-index.json once per session. */
export function useProgrammeIndex(): { index: Index | null; error: boolean } {
  const [index, setIndex] = useState<Index | null>(cached);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (cached) return;
    let alive = true;
    pending ??= fetch(`${BASE}/data/programs-index.json`).then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json() as Promise<Index>; });
    pending.then((d) => { cached = d; if (alive) setIndex(d); }).catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, []);
  return { index, error };
}
