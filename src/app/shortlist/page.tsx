import type { Metadata } from "next";
import { Suspense } from "react";
import { ShortlistClient } from "@/components/ShortlistClient";

export const metadata: Metadata = { title: "My shortlist", description: "Programmes you saved, with deadlines and your application status." };

export default function ShortlistPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted">Loading…</div>}>
      <ShortlistClient />
    </Suspense>
  );
}
