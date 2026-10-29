"use client";

import Link from "next/link";
import { useShortlist } from "@/lib/shortlist";

/** Header link with a live count of saved programmes. */
export function ShortlistLink() {
  const n = Object.keys(useShortlist()).length;
  return (
    <Link href="/shortlist/" className="btn btn-header relative" aria-label={`Shortlist, ${n} saved`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill={n ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .9-4.5 2.5C10.5 3.9 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>
      </svg>
      <span className="hidden sm:inline">Shortlist</span>
      {n > 0 && <span className="ml-0.5 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-gold text-ink text-[11px] font-bold tabular-nums">{n}</span>}
    </Link>
  );
}
