"use client";

import { daysUntil, formatDate, intakeLabel, isEuOnlyAudience, nextDeadline, urgency, type Deadline } from "@/lib/filters";
import { useToday } from "@/lib/useToday";

type BadgeInput = { deadlines: Deadline[]; noDeadline: boolean };

/**
 * Shows the next application deadline in plain words:
 *   Apply by 15 Nov 2026 · 18 days left
 *   Summer 2027 intake, starts April 2027
 */
export function DeadlineBadge({ p, align = "left", compact = false }: { p: BadgeInput; align?: "left" | "right"; compact?: boolean }) {
  const today = useToday();
  const nd = nextDeadline(p, today ?? "2000-01-01");
  const cls = align === "right" ? "md:items-end md:text-right" : "";
  if (!nd) {
    if (compact) {
      return (
        <span className="deadline deadline-unknown inline-flex items-center gap-2 text-sm">
          <span className="dot dot-unknown" />{p.noDeadline ? "Rolling admission" : "See official page"}
        </span>
      );
    }
    return (
      <div className={`flex flex-col gap-0.5 ${cls}`}>
        <span className="deadline deadline-unknown inline-flex items-center gap-2 text-sm">
          <span className="dot dot-unknown" />
          {p.noDeadline ? "No fixed deadline (rolling admission)" : "Deadline: check official page"}
        </span>
      </div>
    );
  }
  const days = today ? daysUntil(nd.date, today) : null;
  const u = urgency(days);
  const left = days === null ? "" : days === 0 ? "closes today" : days === 1 ? "1 day left" : `${days} days left`;
  const intake = intakeLabel(nd.semester, nd.date);
  const euOnly = isEuOnlyAudience(nd.audience);
  if (compact) {
    const intakeShort = nd.semester ? intake?.split(" intake")[0] : null; // "Summer 2027"
    return (
      <div className="flex flex-col">
        <span className={`deadline deadline-${u} inline-flex items-center gap-2`}>
          <span className={`dot dot-${u}`} />
          <span className="font-heading text-base font-bold leading-tight">{formatDate(nd.date)}</span>
        </span>
        <span className="text-xs text-muted pl-4 leading-snug">{[left, intakeShort, euOnly ? "EU date" : ""].filter(Boolean).join(" · ")}</span>
      </div>
    );
  }
  return (
    <div className={`flex flex-col gap-0.5 ${cls}`}>
      <span className={`deadline deadline-${u} inline-flex items-center gap-2 text-sm`}>
        <span className={`dot dot-${u}`} />
        <span>
          <span className="text-muted">{euOnly ? "EU deadline " : "Apply by "}</span>
          <span className="font-semibold">{formatDate(nd.date)}</span>
          {left && <span className="text-muted"> · {left}</span>}
        </span>
      </span>
      {(intake || euOnly) && (
        <span className="text-xs text-muted pl-4">
          {intake}
          {euOnly ? (intake ? " · " : "") + "non-EU date not published, check official page" : ""}
        </span>
      )}
    </div>
  );
}
