import Link from "next/link";
import type { Programme } from "@/lib/data";
import { DeadlineBadge } from "./DeadlineBadge";

export function ProgramRow({ p, today }: { p: Programme; today: string }) {
  return (
    <li className="rule first:border-t-0">
      <Link href={`/programs/${p.slug}`} className="row-link grid gap-2 py-4 md:grid-cols-[1fr_auto] md:gap-6 md:items-start">
        <div className="min-w-0">
          <div className="row-title font-medium text-[15px] leading-snug">{p.name}</div>
          <div className="text-sm text-ink-2 mt-0.5">
            {p.university} <span className="text-muted">· {p.city}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="chip">{p.degree === "Master" ? "Master's" : "Bachelor's"}</span>
            <span className="chip">{p.languageGroup === "English only" ? "English" : "English + German"}</span>
            {p.tuition.free ? <span className="chip chip-green">No tuition fee</span> : p.tuition.unknown ? null : <span className="chip">Tuition fee</span>}
            {p.uniAssist && <span className="chip">uni-assist</span>}
            {p.beginning && <span className="chip">{p.beginning.replace(" semester", "").replace(" and ", " + ").replace(", ", " + ")}</span>}
            {(p.highlights ?? []).filter((h) => h.level === "red").map((h) => (
              <span key={h.label} className="chip chip-red">{h.label.replace(" required", "").replace("German language", "German").replace("APS certificate", "APS")}</span>
            ))}
          </div>
        </div>
        <div className="md:pt-0.5">
          <div className="eyebrow md:hidden mb-1">Application deadline</div>
          <DeadlineBadge p={p} today={today} align="right" />
        </div>
      </Link>
    </li>
  );
}
