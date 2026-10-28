import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { formatDate, getData, stats } from "@/lib/data";
import { asset, site } from "@/lib/site";

export const metadata: Metadata = { title: "About" };

const ICONS: Record<string, React.ReactNode> = {
  "WhatsApp channel": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1l-.9 1.1c-.2.2-.4.2-.6.1-.3-.1-1.2-.5-2.3-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6l.5-.6.3-.5v-.6l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 2.5 1 3 .8 3.6.8.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>
  ),
  "Facebook group": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/></svg>
  ),
  YouTube: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z"/></svg>
  ),
};

const SOCIAL_BLURB: Record<string, string> = {
  "WhatsApp channel": "Announcements, deadline reminders and new programme alerts.",
  "Facebook group": "Ask questions and get answers from students already in Germany.",
  YouTube: "Step-by-step guides on applications, visas and life in Germany.",
};

export default function About() {
  const data = getData();
  const s = stats(data.programmes);
  return (
    <div>
      <section className="band band-pattern">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16 flex flex-col md:flex-row md:items-center gap-8">
          <Image src={asset("/logo.png")} alt="Pak-German Nexus" width={120} height={120} className="rounded-full bg-white shrink-0 ring-4 ring-white/20" />
          <div>
            <div className="eyebrow text-white/60">About</div>
            <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-white">{site.org}</h1>
            <p className="mt-3 text-lg text-white/85 max-w-2xl">
              A volunteer community of students and alumni helping Pakistani students get to Germany. Nobody is paid, nothing is sold, and everything on this site is free.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <section className="-mt-8 relative grid gap-4 md:grid-cols-3">
          {site.social.map((so) => (
            <a key={so.url} href={so.url} target="_blank" rel="noopener" className="card shadow-sm p-5 flex gap-4 hover:border-green-mid transition-colors group">
              <span className="text-green shrink-0 mt-0.5">{ICONS[so.name]}</span>
              <span>
                <span className="font-semibold group-hover:underline">{so.name}</span>
                <span className="block text-sm text-ink-2 mt-1">{SOCIAL_BLURB[so.name]}</span>
              </span>
            </a>
          ))}
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          <Fact value={s.programmes.toLocaleString("en-GB")} label="programmes listed" />
          <Fact value={String(s.universities)} label="universities and colleges" />
          <Fact value={formatDate(data.builtAt.slice(0, 10))} label="data last refreshed" />
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="panel">
            <h2 className="text-xl">How the data works</h2>
            <ol className="mt-5 space-y-5">
              <Step n={1} title="Collected from DAAD">
                Most programmes come from the DAAD <em>International Programmes in Germany</em> database, which universities fill in themselves. Programmes DAAD does not list are added directly from the university website, and their source is shown on the programme page. We include Bachelor&rsquo;s and Master&rsquo;s programmes taught in English, or in English and German.
              </Step>
              <Step n={2} title="Grouped by field">
                DAAD&rsquo;s subject areas are re-grouped into the eleven fields on the homepage, so you can see all Computer Science or all Agriculture programmes at once. A programme can sit in two fields.
              </Step>
              <Step n={3} title="Non-EU deadlines first">
                Where DAAD gives separate dates for EU and non-EU applicants, the non-EU date is shown, because that is what applies to Pakistani students. Dates without a year are assumed to repeat yearly.
              </Step>
              <Step n={4} title="Checked by volunteers">
                Community members check listings against the official university page and fix what is wrong. Reports from students feed the same process.
              </Step>
            </ol>
          </div>

          <div className="space-y-4">
            <div className="panel" id="report">
              <h2 className="text-xl">Found a mistake?</h2>
              <p className="mt-3 text-ink-2">
                {site.reportUrl ? (
                  <>Use the <a href={site.reportUrl} target="_blank" rel="noopener" className="underline">feedback form</a> (no login needed) and name the programme. A volunteer checks the official page and fixes the listing. General suggestions are welcome there too.</>
                ) : site.contactEmail ? (
                  <>Email <a href={`mailto:${site.contactEmail}`} className="underline">{site.contactEmail}</a> with the programme name. A volunteer checks the official page and fixes the listing.</>
                ) : (
                  <>Post the programme name in the <a href={site.social[1].url} target="_blank" rel="noopener" className="underline">Facebook group</a> with what is wrong. A volunteer checks the official page and fixes the listing.</>
                )}
              </p>
            </div>

            <div className="panel">
              <h2 className="text-xl">Before you apply</h2>
              <ul className="mt-3 space-y-2 text-ink-2 list-disc pl-5">
                <li>Open the official programme page from the listing and confirm the deadline and documents yourself.</li>
                <li>Check whether the university wants applications through uni-assist, its own portal, or email.</li>
                <li>Note the semester contribution even when there is no tuition fee. It covers the transport ticket and student services.</li>
                <li>Language requirements differ by programme. IELTS 6.5 is common, but some ask for 6.0 or TOEFL equivalents.</li>
              </ul>
            </div>

            <div className="panel bg-paper-2">
              <h2 className="text-base font-semibold">Disclaimer</h2>
              <p className="mt-2 text-sm text-ink-2">
                This is an independent community project and is not affiliated with DAAD or any university. Information may be outdated or incomplete. The official programme page is the only authoritative source.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-10">
          <Link href="/programs" className="btn btn-primary">Browse all programmes</Link>
        </div>
      </div>
    </div>
  );
}

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <div className="card p-5">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-sm text-muted mt-1">{label}</div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="num">{n}</span>
      <div>
        <div className="font-semibold">{title}</div>
        <p className="mt-1 text-sm text-ink-2 leading-relaxed">{children}</p>
      </div>
    </li>
  );
}
