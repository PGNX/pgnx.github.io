"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { daysUntil, formatDate, intakeLabel, nextDeadline, urgency, type ProgrammeIndex } from "@/lib/filters";
import { STATUSES, shortlist, useShortlist, type SavedItem, type StatusId } from "@/lib/shortlist";
import { useProgrammeIndex } from "@/lib/useProgrammeIndex";
import { useToday } from "@/lib/useToday";
import { site } from "@/lib/site";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
const PIPELINE: StatusId[] = ["interested", "preparing", "applied", "uni-assist", "forwarded", "admitted"];
const SHORT: Record<StatusId, string> = { interested: "Interested", preparing: "Preparing", applied: "Applied", "uni-assist": "uni-assist", forwarded: "Forwarded", admitted: "Admitted", declined: "Declined", withdrawn: "Withdrawn" };
const STRIPE: Record<string, string> = { neutral: "border-l-line-2", info: "border-l-[#2563eb]", good: "border-l-green-mid", bad: "border-l-red", muted: "border-l-line" };
const PILL: Record<string, string> = { neutral: "bg-paper-3 text-ink-2", info: "bg-[#dbeafe] text-[#1e3a8a]", good: "bg-green-soft text-green", bad: "bg-red-soft text-red", muted: "bg-paper-2 text-muted" };

export function ShortlistClient() {
  const saved = useShortlist();
  const { index, error } = useProgrammeIndex();
  const todayLive = useToday();
  const today = todayLive ?? (index?.builtAt.slice(0, 10) ?? "2000-01-01");
  const sp = useSearchParams();
  const [imported, setImported] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusId | "all">("all");

  useEffect(() => {
    const s = sp.get("s");
    if (!s) return;
    const n = shortlist.importSlugs(s.split(",").map((x) => x.trim()).filter(Boolean));
    window.history.replaceState(null, "", window.location.pathname);
    const t = setTimeout(() => setImported(n), 0);
    return () => clearTimeout(t);
  }, [sp]);

  const bySlug = useMemo(() => new Map((index?.programmes ?? []).map((p) => [p.slug, p])), [index]);
  const items = useMemo(() => {
    const rows = Object.entries(saved).map(([slug, meta]) => ({ slug, meta, p: bySlug.get(slug) }));
    rows.sort((a, b) => {
      const da = a.p ? nextDeadline(a.p, today)?.date ?? "9999" : "9999";
      const db = b.p ? nextDeadline(b.p, today)?.date ?? "9999" : "9999";
      return da.localeCompare(db) || (a.p?.name ?? "").localeCompare(b.p?.name ?? "");
    });
    return rows;
  }, [saved, bySlug, today]);
  const shown = filter === "all" ? items : items.filter((r) => r.meta.status === filter);
  const total = items.length;
  const soon = items.filter((r) => { const d = r.p ? nextDeadline(r.p, today) : null; return d && todayLive && daysUntil(d.date, today) <= 60; }).length;
  const inProgress = items.filter((r) => ["applied", "uni-assist", "forwarded"].includes(r.meta.status)).length;
  const admitted = items.filter((r) => r.meta.status === "admitted").length;
  const counts = STATUSES.map((s) => ({ ...s, n: items.filter((r) => r.meta.status === s.id).length })).filter((s) => s.n > 0);

  function shareLink() {
    const url = `${window.location.origin}${BASE}/shortlist/?s=${encodeURIComponent(Object.keys(saved).join(","))}`;
    navigator.clipboard?.writeText(url).then(() => { setCopied("link"); setTimeout(() => setCopied(null), 2000); });
  }
  function copyText() {
    const lines = items.map((r) => {
      const p = r.p; if (!p) return null;
      const d = nextDeadline(p, today);
      return `• ${p.name} – ${p.university}${d ? ` – apply by ${formatDate(d.date)}` : ""} [${STATUSES.find((s) => s.id === r.meta.status)?.label ?? ""}]\n  ${window.location.origin}${BASE}/programs/${p.slug}/`;
    }).filter(Boolean);
    navigator.clipboard?.writeText(`My German programme shortlist (${site.name})\n\n${lines.join("\n")}`).then(() => { setCopied("text"); setTimeout(() => setCopied(null), 2000); });
  }

  return (
    <div>
      {/* ---------- hero ---------- */}
      <section className="band band-pattern">
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-14">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="eyebrow text-white/60">Your application tracker</div>
              <h1 className="mt-2 text-3xl md:text-4xl text-white">My shortlist</h1>
              <p className="mt-2 text-white/80 max-w-xl">Save programmes with the ♥, then move each one along as you apply. Everything stays in this browser.</p>
            </div>
            {total > 0 && (
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={shareLink} className="btn btn-header-solid">{copied === "link" ? "Link copied ✓" : "Copy share link"}</button>
                <button type="button" onClick={copyText} className="btn btn-header">{copied === "text" ? "Copied ✓" : "Copy as text"}</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        {/* ---------- stats ---------- */}
        <div className="-mt-8 relative grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat n={total} label="saved" />
          <Stat n={soon} label="deadlines in 60 days" tone={soon ? "red" : undefined} />
          <Stat n={inProgress} label="applications in progress" tone={inProgress ? "blue" : undefined} />
          <Stat n={admitted} label="admitted" tone={admitted ? "green" : undefined} />
        </div>

        {imported !== null && (
          <div className="mt-4 rounded-md bg-green-soft text-green px-4 py-3 text-sm">
            {imported > 0 ? `Imported ${imported} programme${imported === 1 ? "" : "s"} from the shared link.` : "Everything in that link was already on your shortlist."}
          </div>
        )}

        {error ? (
          <div className="py-16 text-center text-ink-2">Could not load programme data. Please reload the page.</div>
        ) : total === 0 ? (
          <div className="mt-8 panel text-center py-16">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-soft text-red flex items-center justify-center">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .9-4.5 2.5C10.5 3.9 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/></svg>
            </div>
            <h2 className="mt-4 text-xl">Nothing saved yet</h2>
            <p className="mt-2 text-ink-2 max-w-md mx-auto">Tap the heart on any programme to save it here. Then track each application from &ldquo;Interested&rdquo; to &ldquo;Admitted&rdquo;.</p>
            <Link href="/programs/" className="btn btn-primary mt-6">Browse programmes</Link>
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5 text-sm">
                <button type="button" onClick={() => setFilter("all")} className={`chip !py-1 !px-3 ${filter === "all" ? "bg-ink text-white border-transparent" : ""}`}>All · {total}</button>
                {counts.map((s) => (
                  <button key={s.id} type="button" onClick={() => setFilter(s.id)} className={`chip !py-1 !px-3 ${filter === s.id ? "bg-ink text-white border-transparent" : ""}`}>{SHORT[s.id]} · {s.n}</button>
                ))}
              </div>
              <button type="button" onClick={() => { if (window.confirm("Remove all saved programmes?")) shortlist.clear(); }} className="text-sm text-muted hover:text-red underline">Clear all</button>
            </div>

            <ul className="mt-4 grid gap-4 lg:grid-cols-2">
              {shown.map(({ slug, meta, p }) => (
                <li key={slug}>
                  {p ? <Card p={p} meta={meta} slug={slug} today={today} live={Boolean(todayLive)} /> : (
                    <div className="card p-4 flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted">{index ? "This programme is no longer listed." : "Loading…"}</span>
                      {index && <button type="button" onClick={() => shortlist.remove(slug)} className="btn btn-ghost text-red">Remove</button>}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <p className="mt-6 text-xs text-muted">Your shortlist is saved in this browser only. It is not visible to anyone else, and it will not appear on another phone or laptop unless you open your share link there.</p>
          </>
        )}
      </div>
    </div>
  );
}

function Card({ p, meta, slug, today, live }: { p: ProgrammeIndex; meta: SavedItem; slug: string; today: string; live: boolean }) {
  const st = STATUSES.find((s) => s.id === meta.status) ?? STATUSES[0];
  const nd = nextDeadline(p, today);
  const days = nd && live ? daysUntil(nd.date, today) : null;
  const u = urgency(days);
  const stepIdx = PIPELINE.indexOf(meta.status);
  const ended = meta.status === "declined" || meta.status === "withdrawn";
  const [noteOpen, setNoteOpen] = useState(Boolean(meta.note));
  return (
    <article className={`card border-l-4 ${STRIPE[st.tone]} p-5 flex flex-col gap-4 h-full`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/programs/${p.slug}/`} target="_blank" rel="noopener" className="font-heading font-bold text-lg leading-snug hover:underline">{p.name}</Link>
          <div className="text-sm text-ink-2 mt-0.5">{p.university} <span className="text-muted">· {p.city}</span></div>
        </div>
        <button type="button" onClick={() => shortlist.remove(slug)} className="shrink-0 w-8 h-8 inline-flex items-center justify-center rounded-full text-muted hover:text-red hover:bg-red-soft" title="Remove from shortlist" aria-label="Remove from shortlist">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="chip">{p.degree === "Master" ? "Master's" : "Bachelor's"}</span>
        {p.tuition.free ? <span className="chip chip-green">No tuition fee</span> : p.tuition.unknown ? null : <span className="chip">Tuition fee</span>}
        {p.uniAssist && <span className="chip">uni-assist</span>}
        {p.redFlags.map((f) => <span key={f} className="chip chip-red">{f.replace(" required", "").replace("German language", "German").replace("APS certificate", "APS")}</span>)}
      </div>

      {/* deadline */}
      <div className={`rounded-md px-4 py-3 flex items-center justify-between gap-3 ${u === "urgent" ? "bg-red-soft" : u === "soon" ? "bg-amber-soft" : "bg-paper-2"}`}>
        {nd ? (
          <>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted">Apply by</div>
              <div className="font-heading font-bold text-lg leading-tight tabular-nums">{formatDate(nd.date)}</div>
              {nd.semester && <div className="text-xs text-muted">{intakeLabel(nd.semester, nd.date)?.split(" intake")[0]}</div>}
            </div>
            {days !== null && (
              <div className={`text-right font-heading font-bold tabular-nums ${u === "urgent" ? "text-red" : u === "soon" ? "text-amber" : "text-green"}`}>
                <div className="text-2xl leading-none">{days}</div>
                <div className="text-[11px] uppercase tracking-wide">days left</div>
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-ink-2">{p.noDeadline ? "No fixed deadline (rolling admission)" : "Deadline: check the official page"}</div>
        )}
      </div>

      {/* status stepper */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="field-label">Application status</span>
          <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${PILL[st.tone]}`}>{st.label}</span>
        </div>
        {!ended && (
          <ol className="mt-2 flex items-center gap-1" aria-hidden>
            {PIPELINE.map((id, i) => (
              <li key={id} className="flex-1 flex items-center gap-1">
                <button type="button" onClick={() => shortlist.setStatus(slug, id)} title={SHORT[id]}
                  className={`h-2 flex-1 rounded-full transition-colors ${i <= stepIdx ? (id === "admitted" ? "bg-green-mid" : "bg-[#2563eb]") : "bg-paper-3 hover:bg-line-2"}`} />
              </li>
            ))}
          </ol>
        )}
        <select className="control mt-2 text-sm" value={meta.status} onChange={(e) => shortlist.setStatus(slug, e.target.value as StatusId)} aria-label="Application status">
          {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {/* note */}
      <div className="mt-auto">
        {noteOpen ? (
          <textarea className="control text-sm min-h-[44px]" placeholder="Your notes: documents ready, GRE booked, questions for the uni…" defaultValue={meta.note} rows={2} autoFocus={!meta.note}
            onBlur={(e) => { if (e.target.value !== meta.note) shortlist.setNote(slug, e.target.value); if (!e.target.value) setNoteOpen(false); }} />
        ) : (
          <button type="button" onClick={() => setNoteOpen(true)} className="text-sm text-green underline">+ Add a note</button>
        )}
        <div className="mt-2 flex items-center justify-between text-xs text-muted">
          <span>Saved {formatDate(meta.savedAt.slice(0, 10))}</span>
          <Link href={`/programs/${p.slug}/`} target="_blank" rel="noopener" className="btn btn-primary !py-1.5 !px-3 text-xs">Visit Program ↗</Link>
        </div>
      </div>
    </article>
  );
}

function Stat({ n, label, tone }: { n: number; label: string; tone?: "red" | "blue" | "green" }) {
  const c = tone === "red" ? "text-red" : tone === "blue" ? "text-[#1d4ed8]" : tone === "green" ? "text-green" : "text-ink";
  return (
    <div className="card shadow-sm px-4 py-3">
      <div className={`font-heading text-2xl font-bold tabular-nums ${c}`}>{n}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
