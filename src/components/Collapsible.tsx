/** A panel whose body is hidden until opened. Native <details>, works without JavaScript. */
export function Collapsible({ title, hint, children, open = false }: { title: string; hint?: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="panel group" open={open}>
      <summary className="flex items-center justify-between gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-baseline gap-3">
          <span className="text-lg font-semibold">{title}</span>
          {hint && <span className="text-xs text-muted hidden sm:inline">{hint}</span>}
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden><path d="m6 9 6 6 6-6"/></svg>
      </summary>
      <div className="mt-4 pt-4 border-t border-line">{children}</div>
    </details>
  );
}
