import Link from "next/link";
import { AutoSubmitForm } from "@/components/AutoSubmit";
import type { Category, Filters } from "@/lib/data";
import { UniversitySearch, type UniOption } from "@/components/UniversitySearch";

export function FilterForm({ f, cats, cities, unis, quickPicks, hasActive, idPrefix = "" }: { f: Filters; cats: Category[]; cities: { city: string; count: number }[]; unis: UniOption[]; quickPicks: UniOption[]; hasActive: boolean; idPrefix?: string }) {
  const id = (n: string) => `${idPrefix}${n}`;
  return (
    <AutoSubmitForm action="/programs" className="space-y-5">
      {f.sort && <input type="hidden" name="sort" value={f.sort} />}
      {f.n && <input type="hidden" name="n" value={f.n} />}
      <div>
        <label className="field-label" htmlFor={id("uni")}>University (pick one or more)</label>
        <div className="mt-1.5">
          <UniversitySearch universities={unis} quickPicks={quickPicks} selected={f.uni ?? []} />
        </div>
      </div>

      <Select id={id("degree")} label="Degree" name="degree" value={f.degree ?? ""} options={[["", "Both"], ["Bachelor", "Bachelor's"], ["Master", "Master's"]]} />
      <Select id={id("field")} label="Field" name="field" value={f.field ?? ""} options={[["", "All fields"], ...cats.map((c) => [c.id, c.name] as [string, string])]} />
      <Select id={id("city")} label="City" name="city" value={f.city ?? ""} options={[["", "Any city"], ...cities.map((c) => [c.city, `${c.city} (${c.count})`] as [string, string])]} />
      <Select id={id("tuition")} label="Tuition" name="tuition" value={f.tuition ?? ""} options={[["", "Any"], ["free", "No tuition fee"], ["paid", "Tuition fee charged"]]} />
      <Select id={id("intake")} label="Intake" name="intake" value={f.intake ?? ""} options={[["", "Any semester"], ["winter", "Winter (Oct)"], ["summer", "Summer (Apr)"]]} />
      <Select id={id("deadline")} label="Next deadline" name="deadline" value={f.deadline ?? ""} options={[["", "Any time"], ["30", "Within 30 days"], ["60", "Within 60 days"], ["90", "Within 90 days"]]} />

      <div className="space-y-2">
        <Check name="lang" value="english" checked={f.lang === "english"} label="Fully in English (no German modules)" />
        <Check name="uniassist" value="no" checked={f.uniassist === "no"} label="Direct application (not via uni-assist)" />
      </div>

      <noscript>
        <button type="submit" className="btn btn-primary w-full justify-center">Apply filters</button>
      </noscript>
      {hasActive && <Link href="/programs" className="block text-sm text-ink-2 underline">Clear all filters</Link>}
    </AutoSubmitForm>
  );
}

function Select({ id, label, name, value, options }: { id: string; label: string; name: string; value: string; options: [string, string][] }) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <select id={id} name={name} defaultValue={value} className="control mt-1.5">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

function Check({ name, value, checked, label }: { name: string; value: string; checked: boolean; label: string }) {
  return (
    <label className="flex items-start gap-2 text-sm">
      <input type="checkbox" name={name} value={value} defaultChecked={checked} className="mt-0.5 accent-green" />
      <span>{label}</span>
    </label>
  );
}
