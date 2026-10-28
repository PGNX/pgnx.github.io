import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DeadlineBadge } from "@/components/DeadlineBadge";
import { Highlights } from "@/components/Highlights";
import { RichText } from "@/components/RichText";
import { VerifyNotice } from "@/components/VerifyNotice";
import { categoryName, formatDate, getProgrammeBySlug, getProgrammes, isEuOnlyAudience, type Programme } from "@/lib/data";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProgrammes().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProgrammeBySlug((await params).slug);
  if (!p) return {};
  return { title: `${p.name} · ${p.university}`, description: p.description?.slice(0, 160) };
}

export default async function ProgrammePage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProgrammeBySlug((await params).slug);
  if (!p) notFound();
  const nonEuPeriods = p.applicationPeriods.filter((ap) => !isEuOnlyAudience(ap.audience));
  const euPeriods = p.applicationPeriods.filter((ap) => isEuOnlyAudience(ap.audience));
  const reportHref = site.reportUrl
    ? site.reportUrl
    : site.contactEmail
      ? `mailto:${site.contactEmail}?subject=${encodeURIComponent(`Wrong info: ${p.name} (${p.university}) #${p.id}`)}`
      : "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-sm text-muted flex flex-wrap gap-1">
        <Link href="/" className="hover:underline">Home</Link><span>/</span>
        <Link href={`/programs/?degree=${p.degree}`} className="hover:underline">{p.degree}&rsquo;s</Link><span>/</span>
        <Link href={`/programs/?degree=${p.degree}&field=${p.categories[0]}`} className="hover:underline">{categoryName(p.categories[0])}</Link>
      </nav>

      <header className="mt-3 pb-6">
        <div className="flex flex-wrap gap-1.5">
          <span className="chip">{p.degree === "Master" ? "Master's" : "Bachelor's"}</span>
          <span className="chip">{p.languageGroup === "English only" ? "Taught in English" : "English + German"}</span>
          {p.tuition.free ? <span className="chip chip-green">No tuition fee</span> : p.tuition.unknown ? null : <span className="chip">Tuition fee</span>}
          {p.uniAssist && <span className="chip">Apply via uni-assist</span>}
        </div>
        <h1 className="mt-3 text-3xl md:text-4xl font-semibold leading-tight">{p.name}</h1>
        <p className="mt-2 text-lg text-ink-2">
          {p.uniWebsite ? <a href={p.uniWebsite} target="_blank" rel="noopener" className="hover:underline">{p.university}</a> : p.university}
          <span className="text-muted"> · {p.city}</span>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {p.courseWebsite && (
            <a href={p.courseWebsite} target="_blank" rel="noopener" className="btn btn-primary">
              Official programme page <ExtIcon />
            </a>
          )}
          {p.daadUrl && <a href={p.daadUrl} target="_blank" rel="noopener" className="btn btn-secondary">DAAD listing <ExtIcon /></a>}
          {p.applyLinks[0] && !p.uniAssist && (
            <a href={p.applyLinks[0]} target="_blank" rel="noopener" className="btn btn-secondary">Application portal <ExtIcon /></a>
          )}
          {p.uniAssist && (
            <a href="https://www.uni-assist.de/en/" target="_blank" rel="noopener" className="btn btn-secondary">uni-assist <ExtIcon /></a>
          )}
        </div>
      </header>

      <div className="mt-6">
        <VerifyNotice href={p.courseWebsite} />
      </div>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
        <article className="min-w-0 overflow-hidden space-y-4 [overflow-wrap:anywhere]">
          <Highlights items={p.highlights} />
          <Section title="Application deadlines">
            <div className="flex flex-wrap items-start gap-3">
              <span className="text-sm text-muted pt-0.5">Next deadline:</span>
              <DeadlineBadge p={{ deadlines: p.deadlines, noDeadline: /no deadline/i.test(p.daadDeadlineSummary || "") }} />
            </div>
            {nonEuPeriods.length > 0 ? (
              <PeriodList periods={nonEuPeriods} />
            ) : euPeriods.length > 0 ? (
              <p className="mt-3 text-sm text-ink-2">Only dates for EU applicants were published. Non-EU applicants (including Pakistan) should check the official programme page.</p>
            ) : (
              <p className="mt-3 text-sm text-ink-2">{p.daadDeadlineSummary || (p.source === "daad" ? "No deadline information was provided to DAAD. Check the official programme page." : "Deadline not published on the programme page yet. Check the official programme page.")}</p>
            )}
            {euPeriods.length > 0 && (
              <details className="mt-4 text-sm">
                <summary className="cursor-pointer text-muted select-none">Dates for EU/EEA applicants (not applicable to Pakistani students)</summary>
                <PeriodList periods={euPeriods} />
              </details>
            )}
            {p.deadlineNote && <p className="mt-3 text-sm text-ink-2 bg-gold-soft p-3">{p.deadlineNote}</p>}
            <p className="mt-3 text-sm text-muted">
              Dates shown are for non-EU applicants, which includes Pakistan. Deadlines change every year, so confirm on the official programme page.
            </p>
          </Section>

          {p.description && <Section title="About the programme"><Paragraphs text={p.description} /></Section>}

          <Section title="Admission requirements">
            <Facts rows={[
              ["Academic", p.admissionRequirements],
              ["English", p.englishRequirement],
              ["German", p.germanRequirement],
              ["Exemptions", p.languageExemptions],
              ["How to apply", p.applyVia],
            ]} links={p.applyLinks} />
          </Section>

          <Section title="Costs">
            <Facts rows={[
              ["Tuition fee", p.tuition.text || (p.tuition.free ? "None" : null)],
              ["Semester contribution", p.semesterContribution],
              ["Cost of living", p.costsOfLiving],
              ["Funding at the university", p.funding],
            ]} />
          </Section>

          {(p.courseOrganisation || p.internships || p.jointDegree) && (
            <Section title="Course structure">
              <Facts rows={[
                ["Organisation", p.courseOrganisation],
                ["Internships", p.internships],
                ["Joint / double degree", p.jointDegree],
              ]} />
            </Section>
          )}

          {(p.partTimeJobs || p.accommodation || p.supportServices) && (
            <Section title="Student life and support">
              <Facts rows={[
                ["Part-time work", p.partTimeJobs],
                ["Accommodation", p.accommodation],
                ["Support for internationals", p.supportServices],
              ]} />
            </Section>
          )}
        </article>

        <aside className="space-y-6 lg:sticky lg:top-6 self-start min-w-0 [overflow-wrap:anywhere]">
          <div className="card p-5">
            <h2 className="text-base font-semibold">Key facts</h2>
            <dl className="mt-3 text-sm space-y-2.5">
              <KV k="Degree" v={p.degreeTitle || p.degree} />
              <KV k="Duration" v={p.duration} />
              <KV k="Starts" v={p.beginning} />
              <KV k="Language" v={p.languages.join(", ")} />
              <KV k="Mode" v={[p.mode, p.studyMode].filter(Boolean).join(" · ")} />
              <KV k="Tuition" v={p.tuition.free ? "None" : p.tuition.amountPerSemester ? `${p.tuition.amountPerSemester.toLocaleString("en-GB")} EUR / semester` : p.tuition.unknown ? "Not stated, check official page" : "Charged, see costs"} />
              <KV k="Field" v={p.categories.map(categoryName).join(", ")} />
              <KV k="DAAD subject" v={p.fieldsOfStudy.join(", ") || p.subject} />
              {p.contactEmail && <KV k="Contact" v={<a href={`mailto:${p.contactEmail}`} className="underline break-all">{p.contactEmail}</a>} />}
            </dl>
          </div>

          <div className="card p-5 text-sm">
            <h2 className="text-base font-semibold">Data status</h2>
            <dl className="mt-3 space-y-2.5">
              <KV k="Source" v={p.source === "daad" && p.daadUrl ? <a href={p.daadUrl} target="_blank" rel="noopener" className="underline">DAAD database</a> : <a href={p.courseWebsite ?? "#"} target="_blank" rel="noopener" className="underline">University website</a>} />
              <KV k="Fetched" v={formatDate(p.fetchedAt.slice(0, 10))} />
              {p.verifiedAt && p.source !== "university" && <KV k="Checked by" v={`${p.verifiedBy ?? "PGNX volunteer"}, ${formatDate(p.verifiedAt)}`} />}
            </dl>
            {p.notes && <p className="mt-3 p-3 bg-gold-soft text-ink-2">{p.notes}</p>}
            <div className="mt-4 flex flex-col gap-2">
              {reportHref ? (
                <a href={reportHref} target="_blank" rel="noopener" className="btn btn-secondary justify-center">Report wrong information</a>
              ) : (
                <Link href="/about#report" className="btn btn-secondary justify-center">Report wrong information</Link>
              )}
              {site.communityUrl ? (
                <a href={site.communityUrl} target="_blank" rel="noopener" className="btn btn-ghost justify-center">Ask in the PGNX community</a>
              ) : (
                <Link href="/about#community" className="btn btn-ghost justify-center">Ask in the PGNX community</Link>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PeriodList({ periods }: { periods: Programme["applicationPeriods"] }) {
  return (
    <ul className="mt-4 divide-y divide-line border-y border-line">
      {periods.map((ap, i) => (
        <li key={i} className="py-3 grid gap-1 sm:grid-cols-[180px_1fr] text-sm">
          <div className="text-ink-2">
            <div className="font-medium text-ink">{ap.semester ? (ap.semester === "winter" ? "Winter semester" : "Summer semester") : "Application period"}</div>
            <div className="text-muted">{ap.audience}</div>
          </div>
          <RichText text={ap.text} />
        </li>
      ))}
    </ul>
  );
}

function ExtIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel">
      <h2 className="text-lg pb-2 border-b border-line">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Paragraphs({ text }: { text: string }) {
  return <RichText text={text} className="text-[15px] leading-relaxed text-ink-2" />;
}

function Facts({ rows, links = [] }: { rows: [string, string | null][]; links?: string[] }) {
  const present = rows.filter(([, v]) => v);
  if (!present.length) return <p className="text-sm text-muted">Not available here. Check the official programme page.</p>;
  return (
    <dl className="divide-y divide-line border-y border-line">
      {present.map(([k, v]) => (
        <div key={k} className="py-3 grid gap-1 sm:grid-cols-[180px_1fr] text-sm">
          <dt className="font-medium">{k}</dt>
          <dd className="text-ink-2">
            <RichText text={v!} />
            {k === "How to apply" && links.length > 0 && (
              <p className="mt-1"><a href={links[0]} target="_blank" rel="noopener" className="underline break-all">{links[0]}</a></p>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  if (!v) return null;
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2">
      <dt className="text-muted">{k}</dt>
      <dd className="text-ink">{v}</dd>
    </div>
  );
}
