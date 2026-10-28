import type { Highlight } from "@/lib/data";

/** "At a glance": requirements a student must not miss, colour-coded. */
export function Highlights({ items }: { items: Highlight[] }) {
  if (!items?.length) return null;
  const order = { red: 0, amber: 1, green: 2, neutral: 3 };
  const sorted = [...items].sort((a, b) => order[a.level] - order[b.level]);
  return (
    <section className="panel">
      <div className="flex items-baseline justify-between gap-4 pb-2 border-b border-line">
        <h2 className="text-lg">At a glance</h2>
        <span className="text-xs text-muted">Picked out of the official text. Red = must have.</span>
      </div>
      <ul className="mt-4 space-y-2">
        {sorted.map((h) => (
          <li key={h.label} className={`hl hl-${h.level}`}>
            <span className={`dot dot-${h.level === "red" ? "urgent" : h.level === "amber" ? "soon" : h.level === "green" ? "open" : "unknown"} mt-1.5`} />
            <div className="text-sm">
              <div className="hl-label">{h.label}</div>
              {h.detail && <div className="text-ink-2 mt-0.5">{h.detail}</div>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
