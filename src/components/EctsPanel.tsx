import type { EctsInfo } from "@/lib/filters";

/** "ECTS you need": subject credit requirements pulled out of the admission text. */
export function EctsPanel({ ects }: { ects?: EctsInfo }) {
  if (!ects || (!ects.items.length && !ects.total)) return null;
  const sorted = [...ects.items].sort((a, b) => b.credits - a.credits);
  const sum = sorted.reduce((a, b) => a + b.credits, 0);
  return (
    <section className="panel">
      <div className="flex items-baseline justify-between gap-4 pb-2 border-b border-line">
        <h2 className="text-lg">ECTS you need from your Bachelor&rsquo;s</h2>
        <span className="text-xs text-muted">From the admission text. Full wording below.</span>
      </div>

      {ects.total && (
        <div className="mt-4 flex items-center gap-3 rounded-[4px] bg-paper-2 border border-line px-4 py-3">
          <span className="text-2xl font-semibold tabular-nums text-green">{ects.total}</span>
          <span className="text-sm text-ink-2">ECTS total in your previous degree{ects.total === 180 ? " (a 4-year Pakistani Bachelor's with 120+ credit hours usually counts as 180 to 240 ECTS)" : ects.total === 210 ? " (3.5 years; most 4-year Pakistani degrees meet this)" : ects.total === 240 ? " (a full 4-year degree)" : ""}</span>
        </div>
      )}

      {sorted.length > 0 && (
        <ul className="mt-4 divide-y divide-line">
          {sorted.map((it, i) => (
            <li key={i} className="py-2.5 grid grid-cols-[72px_1fr] items-center gap-3">
              <span className="inline-flex items-center justify-center rounded-[4px] bg-green-soft text-green font-semibold tabular-nums text-sm px-2 py-1">{it.credits} ECTS</span>
              <span className="text-sm text-ink">{it.subject}</span>
            </li>
          ))}
        </ul>
      )}

      {sorted.length > 1 && (
        <p className="mt-3 text-xs text-muted">
          {sorted.length} subject requirements, {sum} ECTS together. 1 ECTS is about 25 to 30 hours of study. A typical 3-credit-hour Pakistani course is roughly 4 to 6 ECTS.
        </p>
      )}
    </section>
  );
}
