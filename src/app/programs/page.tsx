import type { Metadata } from "next";
import { Suspense } from "react";
import { ProgramsClient } from "@/components/ProgramsClient";
import { getCategories, getProgrammes } from "@/lib/data";

export const metadata: Metadata = { title: "All programmes" };

export default function ProgramsPage() {
  const cats = getCategories();
  const total = getProgrammes().length;
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted">Loading programmes…</div>}>
      <ProgramsClient cats={cats} total={total} />
    </Suspense>
  );
}
