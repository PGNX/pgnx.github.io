"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Modified Bavarian formula:  German grade = 1 + 3 × (Nmax − Nd) / (Nmax − Nmin)
 * Nmax = best possible grade, Nmin = lowest passing grade, Nd = the grade you obtained.
 * The result is cut off after the first decimal (1.795 -> 1.7), as uni-assist and most universities do.
 */
const PRESETS = [
  { id: "cgpa4-2", short: "CGPA / 4.00", label: "CGPA out of 4.00, pass mark 2.00", max: 4, min: 2, step: 0.01, hint: "Most Pakistani universities (HEC standard)", examples: [2.5, 2.8, 3.0, 3.2, 3.4, 3.6, 3.8, 4.0] },
  { id: "cgpa4-25", short: "CGPA / 4.00 (pass 2.50)", label: "CGPA out of 4.00, pass mark 2.50", max: 4, min: 2.5, step: 0.01, hint: "Universities whose minimum CGPA is 2.50", examples: [2.6, 2.8, 3.0, 3.2, 3.4, 3.6, 3.8, 4.0] },
  { id: "pct-50", short: "Percentage", label: "Percentage, pass mark 50%", max: 100, min: 50, step: 0.1, hint: "Annual-system degrees", examples: [55, 60, 65, 70, 75, 80, 85, 90] },
  { id: "pct-40", short: "Percentage (pass 40%)", label: "Percentage, pass mark 40%", max: 100, min: 40, step: 0.1, hint: "Boards and universities with a 40% pass", examples: [50, 55, 60, 65, 70, 75, 80, 90] },
  { id: "custom", short: "Custom", label: "Custom scale", max: 4, min: 2, step: 0.01, hint: "Enter your university's best grade and minimum pass", examples: [] as number[] },
];

function exact(nd: number, max: number, min: number): number | null {
  if (!(max > min) || isNaN(nd) || nd > max || nd < min) return null;
  return 1 + (3 * (max - nd)) / (max - min);
}
function cut(g: number) { return Math.floor(g * 10 + 1e-9) / 10; }

function band(g: number) {
  if (g <= 1.5) return { label: "Very good", de: "sehr gut", cls: "text-green", bg: "bg-green-soft", note: "Strong for any programme, including those with a 1.5 to 2.0 cut-off." };
  if (g <= 2.5) return { label: "Good", de: "gut", cls: "text-green", bg: "bg-green-soft", note: "Clears the 2.5 cut-off that many selective Master's programmes use." };
  if (g <= 3.5) return { label: "Satisfactory", de: "befriedigend", cls: "text-amber", bg: "bg-amber-soft", note: "Fine for programmes without a grade cut-off. Selective ones may decline." };
  return { label: "Sufficient", de: "ausreichend", cls: "text-red", bg: "bg-red-soft", note: "A pass, but most programmes with a cut-off ask for 3.0 or better." };
}

const CUTOFFS = [
  { g: 2.0, who: "Top programmes (TUM, RWTH, selective M.Sc.)" },
  { g: 2.5, who: "Most selective Master's programmes" },
  { g: 3.0, who: "Many programmes with a basic cut-off" },
];

export function BavarianCalculator() {
  const sp = useSearchParams();
  const g = sp.get("g") ?? "";
  const initialGrade = /^\d+([.,]\d+)?$/.test(g) ? g : "";
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const preset = PRESETS.find((p) => p.id === presetId)!;
  const [max, setMax] = useState(String(preset.max));
  const [min, setMin] = useState(String(preset.min));
  const [grade, setGrade] = useState(initialGrade);

  function choosePreset(id: string) {
    const p = PRESETS.find((x) => x.id === id)!;
    setPresetId(id); setMax(String(p.max)); setMin(String(p.min));
  }

  const nd = parseFloat(grade.replace(",", "."));
  const nmax = parseFloat(max);
  const nmin = parseFloat(min);
  const exactValue = useMemo(() => exact(nd, nmax, nmin), [nd, nmax, nmin]);
  const result = exactValue === null ? null : cut(exactValue);
  const outOfRange = grade !== "" && !isNaN(nd) && !isNaN(nmax) && !isNaN(nmin) && (nd > nmax || nd < nmin);
  const b = result !== null ? band(result) : null;
  const pos = result !== null ? ((result - 1) / 3) * 100 : null; // 1.0 -> 0%, 4.0 -> 100%

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      {/* ---------- inputs ---------- */}
      <div className="panel space-y-6">
        <div>
          <div className="field-label">1. Your grading scale</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p.id} type="button" onClick={() => choosePreset(p.id)}
                className={`px-3 py-1.5 rounded-[4px] text-sm border transition-colors ${presetId === p.id ? "bg-green text-white border-green" : "bg-white border-line-2 text-ink-2 hover:border-ink-2"}`}>
                {p.short}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted">{preset.label}. {preset.hint}.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="max">Best possible grade</label>
            <input id="max" type="number" inputMode="decimal" step="0.01" className="control mt-1.5" value={max} onChange={(e) => { setMax(e.target.value); setPresetId("custom"); }} />
          </div>
          <div>
            <label className="field-label" htmlFor="min">Minimum passing grade</label>
            <input id="min" type="number" inputMode="decimal" step="0.01" className="control mt-1.5" value={min} onChange={(e) => { setMin(e.target.value); setPresetId("custom"); }} />
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="grade">2. Your grade</label>
          <div className="mt-1.5 relative">
            <input id="grade" type="number" inputMode="decimal" step={preset.step} min={nmin} max={nmax}
              placeholder={presetId.startsWith("pct") ? "e.g. 72.5" : "e.g. 3.47"}
              className="control !text-2xl !py-3 !pr-24 font-semibold tabular-nums" value={grade} onChange={(e) => setGrade(e.target.value)} autoFocus />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">{presetId.startsWith("pct") ? "%" : `out of ${max}`}</span>
          </div>
          {outOfRange && <p className="mt-1.5 text-sm text-red">Enter a grade between {nmin} and {nmax}.</p>}
          {preset.examples.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted">
              <span>Try:</span>
              {preset.examples.slice(0, 5).map((x) => (
                <button key={x} type="button" onClick={() => setGrade(String(x))} className="chip hover:border-green-mid hover:text-green">{x}{presetId.startsWith("pct") ? "%" : ""}</button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[4px] bg-paper-2 border border-line p-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium">Modified Bavarian formula</span>
            <span className="text-xs text-muted">cut off after 1 decimal, not rounded</span>
          </div>
          <p className="mt-2 font-mono text-[13px]">grade = 1 + 3 × (Nmax − Nd) / (Nmax − Nmin)</p>
          {exactValue !== null && result !== null ? (
            <p className="mt-1 font-mono text-[13px] text-ink-2">= 1 + 3 × ({nmax} − {nd}) / ({nmax} − {nmin}) = <span className="text-muted">{exactValue.toFixed(4)}</span> → <span className="font-semibold text-ink">{result.toFixed(1)}</span></p>
          ) : (
            <p className="mt-1 font-mono text-[13px] text-muted">= 1 + 3 × (best − yours) / (best − pass)</p>
          )}
        </div>
      </div>

      {/* ---------- result ---------- */}
      <div className="space-y-4">
        <div className={`panel relative overflow-hidden ${b ? b.bg : ""}`}>
          <div className="eyebrow">Your German grade</div>
          <div className="mt-1 flex items-end gap-3">
            <div className={`text-7xl leading-none font-semibold tabular-nums ${b ? b.cls : "text-line-2"}`}>{result !== null ? result.toFixed(1) : "–.–"}</div>
            {b && (
              <div className="pb-1.5">
                <div className={`font-semibold ${b.cls}`}>{b.label}</div>
                <div className="text-xs text-muted">{b.de}</div>
              </div>
            )}
          </div>
          <p className="mt-3 text-sm text-ink-2 min-h-10">{b ? b.note : "Enter your grade on the left. 1.0 is the best German grade, 4.0 is the lowest pass."}</p>

          {/* gauge */}
          <div className="mt-4">
            <div className="relative h-3 rounded-full overflow-hidden flex">
              <div className="h-full bg-green-mid" style={{ width: "16.7%" }} title="1.0–1.5 very good" />
              <div className="h-full bg-[#7fb58f]" style={{ width: "33.3%" }} title="1.6–2.5 good" />
              <div className="h-full bg-gold" style={{ width: "33.3%" }} title="2.6–3.5 satisfactory" />
              <div className="h-full bg-red/70" style={{ width: "16.7%" }} title="3.6–4.0 sufficient" />
            </div>
            {pos !== null && (
              <div className="relative h-0">
                <div className="absolute -top-5 -translate-x-1/2 flex flex-col items-center" style={{ left: `${Math.min(100, Math.max(0, pos))}%` }}>
                  <div className="w-0.5 h-7 bg-ink rounded" />
                </div>
              </div>
            )}
            <div className="mt-1.5 flex justify-between text-[11px] text-muted tabular-nums">
              <span>1.0</span><span>1.5</span><span>2.5</span><span>3.5</span><span>4.0</span>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="font-semibold">Do you clear the usual cut-offs?</div>
          <ul className="mt-3 space-y-2 text-sm">
            {CUTOFFS.map((c) => {
              const ok = result !== null ? result <= c.g : null;
              return (
                <li key={c.g} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center shrink-0 text-xs font-bold ${ok === null ? "bg-paper-3 text-muted" : ok ? "bg-green text-white" : "bg-red-soft text-red"}`}>
                    {ok === null ? "?" : ok ? "✓" : "✕"}
                  </span>
                  <span className="tabular-nums font-medium w-16">≤ {c.g.toFixed(1)}</span>
                  <span className="text-ink-2">{c.who}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {preset.examples.length > 0 && !isNaN(nmax) && !isNaN(nmin) && nmax > nmin && (
          <div className="panel">
            <div className="font-semibold">Quick table for this scale</div>
            <div className="mt-3 grid grid-cols-4 gap-y-2 text-sm tabular-nums">
              {preset.examples.map((x) => {
                const g = exact(x, nmax, nmin);
                const r = g === null ? null : cut(g);
                const bb = r !== null ? band(r) : null;
                return (
                  <div key={x} className={`flex items-baseline gap-1.5 ${grade !== "" && Math.abs(nd - x) < 1e-9 ? "font-semibold" : ""}`}>
                    <span className="text-muted">{x}{presetId.startsWith("pct") ? "%" : ""}</span>
                    <span className={bb ? bb.cls : ""}>{r !== null ? r.toFixed(1) : "–"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
