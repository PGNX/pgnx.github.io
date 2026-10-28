"use client";

import Link from "next/link";
import { useState } from "react";
import type { Degree } from "@/lib/data";

export interface FieldInfo { id: string; name: string; blurb: string; bachelor: number; master: number }

export function FieldPicker({ fields, totals }: { fields: FieldInfo[]; totals: { bachelor: number; master: number } }) {
  const [degree, setDegree] = useState<Degree>("Master");
  const key = degree === "Master" ? "master" : "bachelor";
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Step 1</div>
          <h2 className="text-xl mt-1">Which degree are you applying for?</h2>
        </div>
        <div role="tablist" className="inline-flex border border-line-2 rounded-md bg-white p-0.5">
          {(["Bachelor", "Master"] as Degree[]).map((d) => (
            <button
              key={d}
              role="tab"
              aria-selected={degree === d}
              onClick={() => setDegree(d)}
              className={`px-4 py-1.5 text-sm font-medium rounded-[4px] transition-colors ${degree === d ? "bg-green text-white" : "text-ink-2 hover:bg-paper-2"}`}
            >
              {d === "Master" ? "Master's" : "Bachelor's"}
              <span className={`ml-2 tabular-nums ${degree === d ? "text-white/70" : "text-muted"}`}>{d === "Master" ? totals.master : totals.bachelor}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="eyebrow">Step 2</div>
        <h2 className="text-xl mt-1">Choose your field</h2>
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((f) => (
          <li key={f.id} className="card shadow-sm">
            <Link href={`/programs?degree=${degree}&field=${f.id}`} className="group block p-4 h-full rounded-md hover:border-green-mid hover:bg-paper-2 transition-colors">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-semibold group-hover:underline">{f.name}</span>
                <span className="text-sm text-muted tabular-nums shrink-0">{f[key]}</span>
              </div>
              <div className="text-sm text-muted mt-1">{f.blurb}</div>
            </Link>
          </li>
        ))}
        <li className="card bg-paper-2">
          <Link href={`/programs?degree=${degree}`} className="group block p-4 h-full rounded-md hover:bg-paper-3 transition-colors">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-medium group-hover:underline">All {degree === "Master" ? "Master's" : "Bachelor's"} programmes</span>
              <span className="text-sm text-muted tabular-nums shrink-0">{totals[key]}</span>
            </div>
            <div className="text-sm text-muted mt-1">Not sure yet? Browse everything and filter by city, fee or deadline.</div>
          </Link>
        </li>
      </ul>
    </section>
  );
}
