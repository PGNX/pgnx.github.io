"use client";

import type { Category, Filters } from "@/lib/filters";
import { UniversitySearch, type UniOption } from "@/components/UniversitySearch";

/** Controlled filter panel: every change calls onChange with a patched Filters object. */
export function FilterForm({ f, cats, cities, unis, quickPicks, hasActive, onChange, onClear, idPrefix = "" }: {
  f: Filters; cats: Category[]; cities: { city: string; count: number }[]; unis: UniOption[]; quickPicks: UniOption[];
  hasActive: boolean; onChange: (patch: Partial<Filters>) => void; onClear: () => void; idPrefix?: string;
}) {
  const id = (n: string) => `${idPrefix}${n}`;
  return (
    <div className="space-y-5">
      <div>
        <label className="field-label" htmlFor={id("uni")}>University (pick one or more)</label>
        <div className="mt-1.5">
          <UniversitySearch universities={unis} quickPicks={quickPicks} selected={f.uni ?? []} onChange={(uni) => onChange({ uni })} />
        </div>
      </div>

      <Select id={id("degree")} label="Degree" value={f.degree ?? ""} onChange={(v) => onChange({ degree: v as Filters["degree"] })} options={[["", "Both"], ["Bachelor", "Bachelor's"], ["Master", "Master's"]]} />
      <Select id={id("field")} label="Field" value={f.field ?? ""} onChange={(v) => onChange({ field: v })} options={[["", "All fields"], ...cats.map((c) => [c.id, c.name] as [string, string])]} />
      <Select id={id("city")} label="City" value={f.city ?? ""} onChange={(v) => onChange({ city: v })} options={[["", "Any city"], ...cities.map((c) => [c.city, `${c.city} (${c.count})`] as [string, string])]} />
      <Select id={id("tuition")} label="Tuition" value={f.tuition ?? ""} onChange={(v) => onChange({ tuition: v as Filters["tuition"] })} options={[["", "Any"], ["free", "No tuition fee"], ["paid", "Tuition fee charged"]]} />
      <Select id={id("intake")} label="Intake" value={f.intake ?? ""} onChange={(v) => onChange({ intake: v as Filters["intake"] })} options={[["", "Any semester"], ["winter", "Winter (Oct)"], ["summer", "Summer (Apr)"]]} />
      <Select id={id("deadline")} label="Next deadline" value={f.deadline ?? ""} onChange={(v) => onChange({ deadline: v as Filters["deadline"] })} options={[["", "Any time"], ["30", "Within 30 days"], ["60", "Within 60 days"], ["90", "Within 90 days"]]} />

      <div className="space-y-2">
        <Check checked={f.lang === "english"} onChange={(on) => onChange({ lang: on ? "english" : "" })} label="Fully in English (no German modules)" />
        <Check checked={f.uniassist === "no"} onChange={(on) => onChange({ uniassist: on ? "no" : "" })} label="Direct application (not via uni-assist)" />
      </div>

      {hasActive && <button type="button" onClick={onClear} className="block text-sm text-ink-2 underline">Clear all filters</button>}
    </div>
  );
}

function Select({ id, label, value, options, onChange }: { id: string; label: string; value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="control mt-1.5">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

function Check({ checked, label, onChange }: { checked: boolean; label: string; onChange: (on: boolean) => void }) {
  return (
    <label className="flex items-start gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 accent-green" />
      <span>{label}</span>
    </label>
  );
}
