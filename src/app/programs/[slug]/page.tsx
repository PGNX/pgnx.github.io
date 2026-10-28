import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DeadlineBadge } from "@/components/DeadlineBadge";
import { DeadlineCards } from "@/components/DeadlineCards";
import { Highlights } from "@/components/Highlights";
import { EctsPanel } from "@/components/EctsPanel";
import { RichText } from "@/components/RichText";
import { LongText } from "@/components/LongText";
import { Collapsible } from "@/components/Collapsible";
import { categoryName, formatDate, getProgrammeBySlug, getProgrammes, isEuOnlyAudience, type Programme } from "@/lib/data";
import { reportLink, site } from "@/lib/site";

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
  const noDeadline = /no deadline/i.test(p.daadDeadlineSummary || "");
  const reportHref = site.reportUrl ? reportLink(`${p.name} – ${p.university}`) : site.contactEmail ? `mailto:${site.contactEmail}?subject=${encodeURIComponent(`Wrong info: ${p.name} (${p.university}) #${p.id}`)}` : "";
  const tuitionLabel = p.tuition.free ? "None" : p.tuition.amountPerSemester ? `${p.tuition.amountPerSemester.toLocaleString("en-GB")} EUR / sem.` : p.tuition.unknown ? "Not stated" : "Charged";
  const applyHref = p.uniAssist ? "https://www.uni-assist.de/en/" : p.applyLinks[0] || null;
  const hasLongBits = p.courseOrganisation || p.internships || p.jointDegree;
  const hasLife = p.partTimeJobs || p.accommodation || p.supportServices;
  const hasCosts = p.semesterContribution || p.costsOfLiving || p.funding || (!p.tuition.free && p.tuition.text);

  return (
    <div>
      {/* ---------- title band ---------- */}
      <section className="bg-white border-b border-line">
        <div className="mx-auto max-w-6xl px-4 pt-6 pb-6">
          <nav className="text-sm text-muted flex flex-wrap gap-1">
            <Link href="/" className="hover:underline">Home</Link><span>/</span>
            <Link href={`/programs/?degree=${p.degree}`} className="hover:underline">{p.degree}&rsquo;s</Link><span>/</span>
            <Link href={`/programs/?degree=${p.degree}&field=${p.categories[0]}`} className="hover:underline">{categoryName(p.categories[0])}</Link>
          </nav>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold leading-tight">{p.name}</h1>
          <p className="mt-1.5 text-lg text-ink-2">
            {p.uniWebsite ? <a href={p.uniWebsite} target="_blank" rel="noopener" className="hover:underline">{p.university}</a> : p.university}
            <span className="text-muted"> · {p.city}</span>
          </p>

          {/* fact strip */}
          <dl className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[repeat(5,minmax(0,1fr))_minmax(0,1.5fr)] gap-px bg-line border border-line rounded-md overflow-hidden">
            <Fact k="Degree" v={p.degreeTitle || `${p.degree}'s`} />
            <Fact k="Duration" v={p.duration || "–"} />
            <Fact k="Starts" v={(p.beginning || "–").replace(" semester", "").replace(" and ", " + ").replace(", ", " + ")} />
            <Fact k="Language" v={p.languageGroup === "English only" ? "English" : "English + German"} />
            <Fact k="Tuition" v={tuitionLabel} tone={p.tuition.free ? "good" : undefined} />
            <div className="bg-white px-3 py-2.5 col-span-2 sm:col-span-3 lg:col-span-1">
              <dt className="text-[11px] uppercase tracking-wide text-muted">Next deadline (non-EU)</dt>
              <dd className="mt-0.5"><DeadlineBadge p={{ deadlines: p.deadlines, noDeadline }} compact /></dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {p.courseWebsite && <a href={p.courseWebsite} target="_blank" rel="noopener" className="btn btn-primary">Official programme page <ExtIcon /></a>}
            {applyHref && <a href={applyHref} target="_blank" rel="noopener" className="btn btn-secondary">{p.uniAssist ? "Apply via uni-assist" : "Application portal"} <ExtIcon /></a>}
            {p.daadUrl && <a href={p.daadUrl} target="_blank" rel="noopener" className="btn btn-secondary">DAAD listing <ExtIcon /></a>}
            <span className="text-xs text-muted sm:ml-auto">
              Collected from {p.source === "daad" ? "DAAD" : "the university website"}, {formatDate(p.fetchedAt.slice(0, 10))}. Always confirm on the official page before applying.
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ---------- main ---------- */}
        <article className="min-w-0 overflow-hidden space-y-4 [overflow-wrap:anywhere]">
          <Highlights items={p.highlights} />
          <EctsPanel ects={p.ects} />

          <section className="panel">
            <h2 className="text-lg pb-2 border-b border-line">Application deadlines</h2>
            <DeadlineCards deadlines={p.deadlines} periods={nonEuPeriods} noDeadline={noDeadline} note={p.deadlineNote} />
            {euPeriods.length > 0 && (
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer text-muted select-none">Dates for EU/EEA applicants (not applicable to Pakistani students)</summary>
                <PeriodList periods={euPeriods} />
              </details>
            )}
          </section>

          <section className="panel">
            <h2 className="text-lg pb-2 border-b border-line">Requirements</h2>
            <dl className="divide-y divide-line">
              <Row k="Academic">{p.admissionRequirements ? <LongText text={p.admissionRequirements} limit={380} /> : <Missing />}</Row>
              <Row k="English">{p.englishRequirement ? <LongText text={p.englishRequirement} limit={260} /> : <Missing />}</Row>
              <Row k="German">{p.germanRequirement ? <RichText text={p.germanRequirement} /> : <Missing />}</Row>
              {p.languageExemptions && <Row k="Exemptions"><RichText text={p.languageExemptions} /></Row>}
              <Row k="How to apply">
                {p.applyVia ? <RichText text={p.applyVia} /> : <Missing />}
                {p.applyLinks[0] && <p className="mt-1"><a href={p.applyLinks[0]} target="_blank" rel="noopener" className="underline break-all text-sm">{p.applyLinks[0]}</a></p>}
              </Row>
            </dl>
          </section>

          {p.description && (
            <Collapsible title="About the programme" hint="what you will study">
              <LongText text={p.description} limit={700} className="text-[15px] leading-relaxed text-ink-2" />
            </Collapsible>
          )}

          {hasLongBits && (
            <Collapsible title="Course structure" hint="modules, internships, joint degree">
              <dl className="divide-y divide-line">
                {p.courseOrganisation && <Row k="Organisation"><LongText text={p.courseOrganisation} limit={600} /></Row>}
                {p.internships && <Row k="Internships"><RichText text={p.internships} /></Row>}
                {p.jointDegree && p.jointDegree !== "No" && <Row k="Joint / double degree"><RichText text={p.jointDegree} /></Row>}
              </dl>
            </Collapsible>
          )}

          {hasCosts && (
            <Collapsible title="Costs" hint="semester contribution, living costs, funding">
              <dl className="divide-y divide-line">
                {!p.tuition.free && p.tuition.text && <Row k="Tuition fee"><RichText text={p.tuition.text} /></Row>}
                {p.semesterContribution && <Row k="Semester contribution"><RichText text={p.semesterContribution} /></Row>}
                {p.costsOfLiving && <Row k="Cost of living"><RichText text={p.costsOfLiving} /></Row>}
                {p.funding && <Row k="Funding at the university"><RichText text={p.funding} /></Row>}
              </dl>
            </Collapsible>
          )}

          {hasLife && (
            <Collapsible title="Student life and support" hint="jobs, housing, help for internationals">
              <dl className="divide-y divide-line">
                {p.partTimeJobs && <Row k="Part-time work"><LongText text={p.partTimeJobs} limit={400} /></Row>}
                {p.accommodation && <Row k="Accommodation"><LongText text={p.accommodation} limit={400} /></Row>}
                {p.supportServices && <Row k="Support"><RichText text={p.supportServices} /></Row>}
              </dl>
            </Collapsible>
          )}
        </article>

        {/* ---------- sidebar ---------- */}
        <aside className="space-y-4 lg:sticky lg:top-6 self-start min-w-0 [overflow-wrap:anywhere]">
          <div className="card p-5 text-sm">
            <h2 className="text-base font-semibold">Contact</h2>
            <dl className="mt-3 space-y-2.5">
              {p.contactName && <KV k="Office" v={p.contactName} />}
              {p.contactEmail && <KV k="Email" v={<a href={`mailto:${p.contactEmail}`} className="underline break-all">{p.contactEmail}</a>} />}
              {p.uniWebsite && <KV k="University" v={<a href={p.uniWebsite} target="_blank" rel="noopener" className="underline break-all">{p.uniWebsite.replace(/^https?:\/\//, "").replace(/\/$/, "")}</a>} />}
              <KV k="Field" v={p.categories.map(categoryName).join(", ")} />
              {p.mode && <KV k="Mode" v={[p.mode, p.studyMode].filter(Boolean).join(" · ")} />}
            </dl>
          </div>

          <div className="card p-5 text-sm">
            <h2 className="text-base font-semibold">Something wrong here?</h2>
            <p className="mt-2 text-ink-2">Deadlines and fees change every year. If this page is outdated, tell us and a volunteer will fix it.</p>
            <div className="mt-3 flex flex-col gap-2">
              {reportHref ? <a href={reportHref} target="_blank" rel="noopener" className="btn btn-secondary justify-center">Report wrong information</a> : <Link href="/about/#report" className="btn btn-secondary justify-center">Report wrong information</Link>}
              {site.communityUrl ? <a href={site.communityUrl} target="_blank" rel="noopener" className="btn btn-ghost justify-center">Ask in the PGNX community</a> : <Link href="/about/#community" className="btn btn-ghost justify-center">Ask in the PGNX community</Link>}
            </div>
            {p.verifiedAt && p.source !== "university" && <p className="mt-3 text-xs text-muted">Checked by {p.verifiedBy ?? "a PGNX volunteer"}, {formatDate(p.verifiedAt)}</p>}
            {p.notes && <p className="mt-3 p-3 bg-gold-soft text-ink-2 rounded-[4px]">{p.notes}</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Fact({ k, v, tone }: { k: string; v: string; tone?: "good" }) {
  return (
    <div className="bg-white px-3 py-2.5">
      <dt className="text-[11px] uppercase tracking-wide text-muted">{k}</dt>
      <dd className={`mt-0.5 font-heading text-base font-bold leading-tight ${tone === "good" ? "text-green" : ""}`}>{v}</dd>
    </div>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="py-3 grid gap-1 sm:grid-cols-[150px_1fr] text-sm">
      <dt className="font-medium">{k}</dt>
      <dd className="text-ink-2 min-w-0">{children}</dd>
    </div>
  );
}

function Missing() {
  return <span className="text-muted">Not stated. Check the official programme page.</span>;
}

function PeriodList({ periods }: { periods: Programme["applicationPeriods"] }) {
  return (
    <ul className="mt-3 divide-y divide-line">
      {periods.map((ap, i) => (
        <li key={i} className="py-2.5 grid gap-1 sm:grid-cols-[150px_1fr] text-sm">
          <div>
            <div className="font-medium">{ap.semester ? (ap.semester === "winter" ? "Winter semester" : "Summer semester") : "Application period"}</div>
            <div className="text-xs text-muted">{ap.audience}</div>
          </div>
          <RichText text={ap.text} className="text-ink-2" />
        </li>
      ))}
    </ul>
  );
}

function ExtIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>;
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  if (!v) return null;
  return (
    <div className="grid grid-cols-[84px_1fr] gap-2">
      <dt className="text-muted">{k}</dt>
      <dd className="text-ink">{v}</dd>
    </div>
  );
}
