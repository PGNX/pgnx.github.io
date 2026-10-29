"use client";

import { shortlist, useShortlist } from "@/lib/shortlist";

/** Heart toggle. `variant="icon"` for list rows, `"button"` for the programme page. */
export function SaveButton({ slug, variant = "icon", className = "" }: { slug: string; variant?: "icon" | "button"; className?: string }) {
  const list = useShortlist();
  const saved = Boolean(list[slug]);
  const label = saved ? "Saved to shortlist" : "Save to shortlist";
  const Heart = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .9-4.5 2.5C10.5 3.9 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>
    </svg>
  );
  if (variant === "icon") {
    return (
      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); shortlist.toggle(slug); }} aria-pressed={saved} aria-label={label} title={label}
        className={`inline-flex items-center justify-center w-9 h-9 rounded-full border transition-colors ${saved ? "bg-red-soft border-transparent text-red" : "bg-white border-line text-muted hover:text-red hover:border-red/40"} ${className}`}>
        {Heart}
      </button>
    );
  }
  return (
    <button type="button" onClick={() => shortlist.toggle(slug)} aria-pressed={saved} className={`btn ${saved ? "bg-red-soft text-red border-transparent" : "btn-secondary"} ${className}`}>
      {Heart}{saved ? "Saved ✓" : "Save to shortlist"}
    </button>
  );
}
