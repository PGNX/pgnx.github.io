"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { FilterForm } from "@/components/FilterForm";
import { ProgramRow } from "@/components/ProgramRow";
import { VerifyNotice } from "@/components/VerifyNotice";
import { PAGE_SIZES, buildQuery, categoryNameFrom, filterProgrammes, pageSize, parseFiltersFromSearch, topCities, topUniversities, universities, type Category, type Filters } from "@/lib/filters";
import { useToday } from "@/lib/useToday";
import { useProgrammeIndex } from "@/lib/useProgrammeIndex";

/** Client-side programme list for the static site: loads the slim index once and filters in the browser. */
export function ProgramsClient({ cats, total }: { cats: Category[]; total: number }) {
  const router = useRouter();
  const sp = useSearchParams();
  const todayLive = useToday();
  const f = useMemo(() => parseFiltersFromSearch(new URLSearchParams(sp.toString())), [sp]);
  const { index, error } = useProgrammeIndex();
  const today = todayLive ?? (index?.builtAt.slice(0, 10) ?? "2000-01-01");

  const all = useMemo(() => index?.programmes ?? [], [index]);
  const results = useMemo(() => filterProgrammes(all, f, today), [all, f, today]);
  const cities = useMemo(() => topCities(all), [all]);
  const unis = useMemo(() => universities(all), [all]);
  const quickPicks = useMemo(() => topUniversities(all, 4), [all]);

  const per = pageSize(f);
  const pages = Math.max(1, Math.ceil(results.length / per));
  const page = Math.min(pages, Math.max(1, Number(f.page) || 1));
  const slice = results.slice((page - 1) * per, page * per);
  const pageLinks = pageNumbers(page, pages);

  function go(patch: Partial<Filters>, resetPage = true) {
    const q = buildQuery(f, { ...patch, ...(resetPage ? { page: "" } : {}) });
    router.push(`/programs/${q}`, { scroll: false });
  }
  const href = (patch: Partial<Filters>) => `/programs/${buildQuery(f, patch)}`;

  const active: { label: string; patch: Partial<Filters> }[] = [];
  if (f.degree) active.push({ label: `${f.degree}'s`, patch: { degree: "" } });
  if (f.field) active.push({ label: categoryNameFrom(cats, f.field), patch: { field: "" } });
  for (const u of f.uni ?? []) active.push({ label: u, patch: { uni: (f.uni ?? []).filter((x) => x !== u) } });
  if (f.city) active.push({ label: f.city, patch: { city: "" } });
  if (f.tuition) active.push({ label: f.tuition === "free" ? "No tuition fee" : "Tuition fee", patch: { tuition: "" } });
  if (f.intake) active.push({ label: `${f.intake === "winter" ? "Winter" : "Summer"} intake`, patch: { intake: "" } });
  if (f.lang) active.push({ label: "English only", patch: { lang: "" } });
  if (f.uniassist) active.push({ label: "Direct application", patch: { uniassist: "" } });
  if (f.deadline) active.push({ label: `Deadline within ${f.deadline} days`, patch: { deadline: "" } });

  const unisSel = f.uni ?? [];
  const title = unisSel.length === 1 ? unisSel[0] : unisSel.length > 1 ? `${unisSel.length} universities` : f.field ? categoryNameFrom(cats, f.field) : "All programmes";
  const count = index ? results.length : total;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-sm text-muted">
        <Link href="/" className="hover:underline">Home</Link> <span className="mx-1">/</span> Programmes
      </nav>
      <div className="mt-2">
        <h1 className="text-3xl font-semibold">{f.degree ? `${f.degree}'s · ` : ""}{title}</h1>
        <p className="mt-1 text-sm text-ink-2">
          <span className="tabular-nums font-medium text-ink">{count.toLocaleString("en-GB")}</span> programme{count === 1 ? "" : "s"}
          {f.degree ? "" : " across Bachelor's and Master's"} · English-taught · from DAAD and university websites
        </p>
      </div>

      <div className="mt-4"><VerifyNotice compact /></div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside>
          <details className="lg:hidden card">
            <summary className="px-4 py-3 font-medium cursor-pointer select-none">Filters{active.length ? ` (${active.length} active)` : ""}</summary>
            <div className="p-4 border-t border-line">
              <FilterForm f={f} cats={cats} cities={cities} unis={unis} quickPicks={quickPicks} hasActive={active.length > 0} onChange={(p) => go(p)} onClear={() => router.push("/programs/")} idPrefix="m-" />
            </div>
          </details>
          <div className="hidden lg:block panel">
            <FilterForm f={f} cats={cats} cities={cities} unis={unis} quickPicks={quickPicks} hasActive={active.length > 0} onChange={(p) => go(p)} onClear={() => router.push("/programs/")} />
          </div>
        </aside>

        <section className="min-w-0 panel">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line">
            <div className="flex flex-wrap gap-1.5 min-h-6">
              {active.map((a) => (
                <Link key={a.label} href={href({ ...a.patch, page: "" })} scroll={false} className="chip hover:border-ink-2" title="Remove filter">
                  {a.label}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted">Sort</span>
              {(["name", "deadline", "university"] as const).map((s) => {
                const on = (f.sort || "name") === s;
                return (
                  <Link key={s} href={href({ sort: s, page: "" })} scroll={false} className={`px-2 py-1 rounded-[4px] ${on ? "bg-ink text-white" : "text-ink-2 hover:bg-paper-2"}`}>
                    {s === "name" ? "A–Z" : s === "deadline" ? "Deadline" : "University"}
                  </Link>
                );
              })}
            </div>
          </div>

          {error ? (
            <div className="py-16 text-center text-ink-2">Could not load the programme list. Please reload the page.</div>
          ) : !index ? (
            <div className="py-16 text-center text-muted">Loading programmes…</div>
          ) : slice.length === 0 ? (
            <div className="py-16 text-center text-ink-2">
              <p>No programmes match these filters.</p>
              <Link href="/programs/" className="underline mt-2 inline-block">Clear filters</Link>
            </div>
          ) : (
            <>
              <div className="hidden md:grid md:grid-cols-[1fr_auto] gap-6 pt-3 pb-1 eyebrow">
                <span>Programme</span>
                <span className="text-right">Application deadline (non-EU)</span>
              </div>
              <ul>
                {slice.map((p) => <ProgramRow key={p.id} p={p} />)}
              </ul>
            </>
          )}

          {index && (
            <nav className="mt-6 pt-4 border-t border-line flex flex-wrap items-center justify-between gap-4 text-sm" aria-label="Pagination">
              <div className="flex items-center gap-2 text-ink-2">
                <span>Per page</span>
                {PAGE_SIZES.map((n) => (
                  <Link key={n} href={href({ n: String(n), page: "" })} scroll={false} className={`px-2 py-1 rounded-[4px] tabular-nums ${per === n ? "bg-ink text-white" : "hover:bg-paper-2"}`}>{n}</Link>
                ))}
              </div>
              <div className="text-muted tabular-nums">
                {results.length === 0 ? "0 results" : `${(page - 1) * per + 1}–${Math.min(page * per, results.length)} of ${results.length.toLocaleString("en-GB")}`}
              </div>
              {pages > 1 && (
                <div className="flex items-center gap-1">
                  <Link aria-disabled={page === 1} className={`btn btn-secondary px-2.5 ${page === 1 ? "pointer-events-none opacity-40" : ""}`} href={href({ page: String(page - 1) })}>Previous</Link>
                  {pageLinks.map((n, i) =>
                    n === 0 ? <span key={`gap-${i}`} className="px-1 text-muted">…</span> : (
                      <Link key={n} href={href({ page: String(n) })} className={`min-w-8 text-center px-2 py-1.5 rounded-[4px] tabular-nums ${n === page ? "bg-green text-white" : "hover:bg-paper-2"}`} aria-current={n === page ? "page" : undefined}>{n}</Link>
                    )
                  )}
                  <Link aria-disabled={page === pages} className={`btn btn-secondary px-2.5 ${page === pages ? "pointer-events-none opacity-40" : ""}`} href={href({ page: String(page + 1) })}>Next</Link>
                </div>
              )}
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}

/** 1 … 4 5 [6] 7 8 … 20 ; 0 marks a gap */
function pageNumbers(page: number, pages: number): number[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set<number>([1, pages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((n) => set.add(n));
  if (page >= pages - 2) [pages - 1, pages - 2, pages - 3].forEach((n) => set.add(n));
  const sorted = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const out: number[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push(0);
    out.push(sorted[i]);
  }
  return out;
}
