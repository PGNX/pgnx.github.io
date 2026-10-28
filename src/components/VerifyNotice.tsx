/** Reminder shown on programme pages: this site is a starting point, the university page is the authority. */
export function VerifyNotice({ href, compact = false }: { href?: string | null; compact?: boolean }) {
  return (
    <div className={`flex gap-3 border border-[#e9d48a] bg-gold-soft text-ink-2 rounded-[4px] ${compact ? "px-3 py-2 text-sm" : "px-4 py-3 text-sm"}`} role="note">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-amber" aria-hidden><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
      <p>
        <strong className="text-ink">Verify before you act.</strong> Deadlines, fees and requirements here are collected from DAAD and university pages and can be outdated. Always confirm on the{" "}
        {href ? <a href={href} target="_blank" rel="noopener" className="underline font-medium">official programme page</a> : "official programme page"} before applying. Do not rely on this website alone.
      </p>
    </div>
  );
}
