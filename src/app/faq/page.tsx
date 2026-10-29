import type { Metadata } from "next";
import Link from "next/link";
import { FAQ, FAQ_CHECKED } from "@/data/faq";
import { formatDate } from "@/lib/data";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "FAQ for Pakistani students", description: "Tuition, uni-assist, GRE, blocked account, visa from Pakistan: the questions every applicant asks, answered with sources." };

export default function FaqPage() {
  const total = FAQ.reduce((n, g) => n + g.items.length, 0);
  return (
    <div>
      <section className="band band-pattern">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
          <div className="eyebrow text-white/60">Questions and answers</div>
          <h1 className="mt-2 text-3xl md:text-4xl text-white">FAQ for Pakistani students</h1>
          <p className="mt-3 text-white/85 max-w-2xl">
            {total} questions we get asked every week in the community: tuition, uni-assist, GRE, the blocked account and the visa from Islamabad. Short answers, with links to the official sources.
          </p>
          <nav className="mt-5 flex flex-wrap gap-2">
            {FAQ.map((g) => (
              <a key={g.id} href={`#${g.id}`} className="btn btn-header !bg-white/10 hover:!bg-white hover:!text-green">{g.title}</a>
            ))}
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-10 min-w-0">
          {FAQ.map((g) => (
            <section key={g.id} id={g.id} className="scroll-mt-6">
              <h2 className="text-2xl">{g.title}</h2>
              <p className="mt-1 text-sm text-muted">{g.blurb}</p>
              <div className="mt-4 space-y-2">
                {g.items.map((it) => (
                  <details key={it.q} className="card group">
                    <summary className="flex items-start justify-between gap-4 cursor-pointer list-none px-5 py-4 [&::-webkit-details-marker]:hidden">
                      <span className="font-heading font-bold text-[15px] leading-snug">{it.q}</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-muted transition-transform group-open:rotate-180" aria-hidden><path d="m6 9 6 6 6-6"/></svg>
                    </summary>
                    <div className="px-5 pb-5 text-[15px] leading-relaxed text-ink-2 space-y-3 border-t border-line pt-4">
                      {it.a.map((p, i) => <p key={i}>{p}</p>)}
                      {it.links && it.links.length > 0 && (
                        <ul className="flex flex-wrap gap-2 pt-1">
                          {it.links.map((l) => (
                            <li key={l.url}>
                              {l.url.startsWith("/") ? (
                                <Link href={l.url} className="chip hover:border-green-mid hover:text-green">{l.label}</Link>
                              ) : (
                                <a href={l.url} target="_blank" rel="noopener" className="chip hover:border-green-mid hover:text-green">{l.label} ↗</a>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 self-start">
          <div className="card p-5 text-sm">
            <h2 className="text-base font-semibold">Still have a question?</h2>
            <p className="mt-2 text-ink-2">Ask students who are already in Germany. Nobody sells anything, nobody charges.</p>
            <a href={site.communityUrl} target="_blank" rel="noopener" className="btn btn-primary mt-3 w-full justify-center">Join the PGNX community</a>
          </div>
          <div className="card p-5 text-sm">
            <h2 className="text-base font-semibold">Useful tools</h2>
            <ul className="mt-2 space-y-1.5">
              <li><Link href="/gpa/" className="underline">German grade calculator</Link></li>
              <li><Link href="/programs/?tuition=free&sort=deadline" className="underline">No-tuition programmes by deadline</Link></li>
              <li><Link href="/map/" className="underline">Map of universities</Link></li>
              <li><Link href="/shortlist/" className="underline">My shortlist</Link></li>
            </ul>
          </div>
          <div className="card p-5 text-xs text-muted">
            Facts checked on {formatDate(FAQ_CHECKED)} against the linked sources. Amounts and rules change; the embassy, uni-assist and the university page are the final word.
          </div>
        </aside>
      </div>
    </div>
  );
}
