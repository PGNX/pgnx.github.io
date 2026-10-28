import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BavarianCalculator } from "@/components/BavarianCalculator";

export const metadata: Metadata = {
  title: "German grade calculator (Bavarian formula)",
  description: "Convert your Pakistani CGPA or percentage to the German grading scale with the modified Bavarian formula.",
};

export default function GpaPage() {
  return (
    <div>
      <section className="band band-pattern">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
          <div className="eyebrow text-white/60">Tool</div>
          <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-white">German grade calculator</h1>
          <p className="mt-3 text-lg text-white/85 max-w-2xl">
            Convert your CGPA or percentage to the German 1.0 to 4.0 scale with the modified Bavarian formula, the conversion most German universities and uni-assist use.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <Suspense fallback={null}><BavarianCalculator /></Suspense>

        <div className="grid gap-4 md:grid-cols-2 text-sm text-ink-2">
          <div className="panel">
            <h2 className="text-base font-semibold text-ink">How to read the result</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Many programmes ask for a German grade of <strong>2.5 or better</strong>. Some top programmes want 2.0 or better.</li>
              <li>Programme pages on this site show the grade requirement under <em>At a glance</em> when the university states one.</li>
              <li>The minimum passing grade matters a lot. Check your transcript or degree regulations for the exact pass mark of your university.</li>
            </ul>
          </div>
          <div className="panel">
            <h2 className="text-base font-semibold text-ink">Caution</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>This is an estimate. Universities and uni-assist may apply their own scale, use your university&rsquo;s official pass mark, or convert each subject separately.</li>
              <li>We cut off after the first decimal, as uni-assist and most universities do. A few universities round instead, so 1.795 could become 1.8 there.</li>
              <li>Always confirm the grade requirement on the official programme page before applying.</li>
            </ul>
          </div>
        </div>

        <p className="text-sm">
          <Link href="/programs" className="btn btn-primary">Find programmes</Link>
        </p>
      </div>
    </div>
  );
}
