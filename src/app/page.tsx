import Link from "next/link";
import { FieldPicker, type FieldInfo } from "@/components/FieldPicker";
import { CATEGORY_BLURBS, formatDate, getCategories, getData, getProgrammes, stats } from "@/lib/data";
import { site } from "@/lib/site";

export default function Home() {
  const all = getProgrammes();
  const s = stats(all);
  const data = getData();
  const fields: FieldInfo[] = getCategories().map((c) => ({
    id: c.id,
    name: c.name,
    blurb: CATEGORY_BLURBS[c.id] ?? "",
    bachelor: all.filter((p) => p.degree === "Bachelor" && p.categories.includes(c.id)).length,
    master: all.filter((p) => p.degree === "Master" && p.categories.includes(c.id)).length,
  }));

  return (
    <div>
      <section className="band band-pattern">
        <div className="mx-auto max-w-6xl px-4 pt-12 pb-16 md:pt-16 md:pb-20">
          <div className="eyebrow text-white/60">A {site.org} community project</div>
          <h1 className="mt-3 text-3xl md:text-[42px] md:leading-[1.15] font-semibold max-w-3xl text-white">
            English-taught Bachelor&rsquo;s and Master&rsquo;s programmes in Germany
          </h1>
          <p className="mt-4 text-base md:text-lg text-white/80 max-w-2xl">
            Choose your degree and field to see every programme with its application deadline for non-EU applicants, tuition status and a direct link to the official university page.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <dl className="-mt-8 relative grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Programmes" value={s.programmes} />
          <Stat label="Universities" value={s.universities} />
          <Stat label="Cities" value={s.cities} />
          <Stat label="No tuition fee" value={s.free} />
        </dl>
        <p className="mt-3 text-sm text-muted">
          Source: DAAD International Programmes database and university websites, refreshed {formatDate(data.builtAt.slice(0, 10))}. This site is a starting point: always verify deadlines, fees and requirements on the official programme page before you apply.
        </p>

      <div className="py-10 md:py-12">
        <FieldPicker fields={fields} totals={{ bachelor: s.bachelors, master: s.masters }} />
      </div>

      <section className="mb-6 card p-5 flex flex-col md:flex-row md:items-center gap-4 border-l-4 border-l-green">
        <div className="flex-1">
          <h3 className="font-semibold text-base">What is my grade in the German system?</h3>
          <p className="mt-1 text-sm text-ink-2">Convert your CGPA or percentage with the modified Bavarian formula and see whether you clear the usual 2.5 cut-off.</p>
        </div>
        <Link href="/gpa" className="btn btn-primary shrink-0">Open grade calculator</Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3 pb-4 text-sm">
        <div className="panel">
          <h3 className="font-semibold">Why this exists</h3>
          <p className="mt-2 text-sm text-ink-2">
            DAAD lists these programmes, but finding every option in your field and comparing deadlines takes hours of clicking. Here the same data is grouped by field, filterable and sortable by deadline.
          </p>
        </div>
        <div className="panel">
          <h3 className="font-semibold">What to double-check</h3>
          <p className="mt-2 text-sm text-ink-2">
            Deadlines, fees and language requirements are reported by universities to DAAD and change yearly. Treat every page here as a starting point and confirm on the official programme page before you apply.
          </p>
        </div>
        <div className="panel">
          <h3 className="font-semibold">Spotted an error?</h3>
          <p className="mt-2 text-sm text-ink-2">
            Every programme page has a report link. Volunteers review reports and fix the listing, so the next student gets correct information. <Link href="/about" className="underline">How the data works</Link>.
          </p>
        </div>
      </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card px-4 py-3 shadow-sm">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="text-2xl font-semibold tabular-nums mt-0.5">{value.toLocaleString("en-GB")}</dd>
    </div>
  );
}
