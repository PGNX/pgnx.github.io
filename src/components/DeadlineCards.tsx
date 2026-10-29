"use client";

import { daysUntil, formatDate, intakeLabel, isEuOnlyAudience, urgency, type ApplicationPeriod, type Deadline } from "@/lib/filters";
import { useToday } from "@/lib/useToday";
import { RichText } from "./RichText";

/** Roll a yearly date forward until it is in the future. */
function upcoming(dateISO: string, today: string): string {
  let d = dateISO;
  let guard = 0;
  while (daysUntil(d, today) < 0 && guard++ < 10) d = `${+d.slice(0, 4) + 1}${d.slice(4)}`;
  return d;
}

const SEM = {
  winter: { label: "Winter intake", icon: "❄", card: "border-l-green bg-green-soft/40", chip: "bg-green text-white" },
  summer: { label: "Summer intake", icon: "☀", card: "border-l-gold bg-gold-soft/50", chip: "bg-gold text-ink" },
  none: { label: "Application period", icon: "•", card: "border-l-line-2 bg-paper-2", chip: "bg-paper-3 text-ink-2" },
};

/** Colour-coded deadline cards for the programme page. Dates are computed in the browser so "days left" is always current. */
export function DeadlineCards({ deadlines, periods, noDeadline, note }: { deadlines: Deadline[]; periods: ApplicationPeriod[]; noDeadline: boolean; note?: string | null }) {
  const today = useToday() ?? "2000-01-01"; // before hydration: show stored dates, no countdown
  const live = today !== "2000-01-01";
  const dated = deadlines
    .filter((d) => !isEuOnlyAudience(d.audience))
    .map((d) => ({ ...d, date: upcoming(d.date, today) }))
    .sort((a, b) => a.date.localeCompare(b.date));
  // dedupe same semester+date
  const seen = new Set<string>();
  const cards = dated.filter((d) => { const k = `${d.semester}|${d.date}`; if (seen.has(k)) return false; seen.add(k); return true; });
  const undated = periods.filter((p) => !isEuOnlyAudience(p.audience) && !p.dates.length);

  if (!cards.length && !undated.length) {
    return (
      <p className="mt-3 text-sm text-ink-2">
        {noDeadline ? "This programme has no fixed deadline (rolling admission). Apply as early as you can." : "Deadline not published. Check the official programme page."}
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {cards.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {cards.map((d, i) => {
            const days = live ? daysUntil(d.date, today) : null;
            const u = urgency(days);
            const sem = SEM[d.semester ?? "none"];
            const intake = intakeLabel(d.semester, d.date);
            const left = days === null ? "" : days === 0 ? "Closes today" : days === 1 ? "1 day left" : `${days} days left`;
            const pill = u === "urgent" ? "bg-red text-white" : u === "soon" ? "bg-amber text-white" : "bg-green-soft text-green";
            return (
              <li key={`${d.semester}-${d.date}`} className={`relative rounded-md border border-line border-l-4 ${sem.card} p-4`}>
                {i === 0 && live && <span className="absolute -top-2.5 right-3 text-[10px] font-bold uppercase tracking-wider bg-ink text-white rounded-full px-2 py-0.5">Next</span>}
                <div className="flex items-center justify-between gap-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2 py-0.5 ${sem.chip}`}>
                    <span aria-hidden>{sem.icon}</span>{sem.label}
                  </span>
                  {left && <span className={`text-xs font-semibold rounded-full px-2 py-0.5 tabular-nums ${pill}`}>{left}</span>}
                </div>
                <div className="mt-3 text-xs uppercase tracking-wide text-muted">Apply by</div>
                <div className="font-heading text-2xl font-bold leading-tight tabular-nums">{formatDate(d.date)}</div>
                {intake && <div className="mt-1 text-sm text-ink-2">{intake.replace(" intake", "")}</div>}
                {d.text && !/^until\s/i.test(d.text.trim()) && <div className="mt-2 text-xs text-muted">{d.text.length > 140 ? d.text.slice(0, 137) + "…" : d.text}</div>}
                <div className="mt-2 text-[11px] text-muted">{d.audience}</div>
              </li>
            );
          })}
        </ul>
      )}

      {undated.length > 0 && (
        <ul className="divide-y divide-line border-y border-line">
          {undated.map((ap, i) => (
            <li key={i} className="py-2.5 grid gap-1 sm:grid-cols-[150px_1fr] text-sm">
              <div>
                <div className="font-medium">{ap.semester ? (ap.semester === "winter" ? "Winter semester" : "Summer semester") : "Application period"}</div>
                <div className="text-xs text-muted">{ap.audience}</div>
              </div>
              <RichText text={ap.text} className="text-ink-2" />
            </li>
          ))}
        </ul>
      )}

      {note && <p className="text-sm text-ink-2 bg-gold-soft p-3 rounded-[4px]">{note}</p>}
      <p className="text-xs text-muted">Dates without a year repeat every year. Pakistani applicants count as non-EU. Confirm on the official programme page.</p>
    </div>
  );
}
