// Pure helpers shared by server and client code. No Node imports here.

export type Degree = "Bachelor" | "Master";

export interface Deadline {
  semester: "winter" | "summer" | null;
  audience: string;
  date: string; // YYYY-MM-DD
  text: string;
}

export interface ApplicationPeriod {
  audience: string;
  semester: "winter" | "summer" | null;
  text: string;
  dates: { day: number; month: number; year: number | null }[];
}

export interface Highlight { level: "red" | "amber" | "green" | "neutral"; label: string; detail: string | null }

export interface Programme {
  id: number;
  slug: string;
  source: "daad" | "university";
  name: string;
  university: string;
  city: string;
  degree: Degree;
  degreeTitle: string | null;
  languageGroup: "English only" | "German & English";
  languages: string[];
  languageNote: string | null;
  duration: string | null;
  beginning: string | null;
  mode: string | null;
  studyMode: string | null;
  subject: string;
  fieldsOfStudy: string[];
  subjectGroups: string[];
  categories: string[];
  tuition: { free: boolean; unknown?: boolean; text: string; amountPerSemester: number | null };
  semesterContribution: string | null;
  costsOfLiving: string | null;
  funding: string | null;
  applicationPeriodsText: string | null;
  applicationPeriods: ApplicationPeriod[];
  deadlines: Deadline[];
  daadDeadlineSummary: string;
  applyVia: string | null;
  applyLinks: string[];
  uniAssist: boolean;
  admissionRequirements: string | null;
  englishRequirement: string | null;
  germanRequirement: string | null;
  languageExemptions: string | null;
  description: string | null;
  courseOrganisation: string | null;
  internships: string | null;
  jointDegree: string | null;
  partTimeJobs: string | null;
  accommodation: string | null;
  supportServices: string | null;
  courseWebsite: string | null;
  uniWebsite: string | null;
  contactEmail: string | null;
  contactName: string | null;
  uniLogo: string | null;
  daadUrl: string | null;
  deadlineNote?: string | null;
  sources?: string[];
  confidence?: "high" | "medium" | "low";
  highlights: Highlight[];
  fetchedAt: string;
  verifiedAt: string | null;
  verifiedBy: string | null;
  notes: string | null;
}

export interface Category {
  id: string;
  name: string;
  count: number;
}

export interface Dataset {
  builtAt: string;
  source: string;
  categories: Category[];
  programmes: Programme[];
}

/** Pure variant of categoryName for client code. */
export function categoryNameFrom(cats: Category[], id: string): string {
  return cats.find((c) => c.id === id)?.name ?? "Other";
}

/** Build a Filters object from a URLSearchParams (client side). */
export function parseFiltersFromSearch(sp: URLSearchParams): Filters {
  const rec: Record<string, string | string[]> = {};
  for (const [k, v] of sp.entries()) {
    const cur = rec[k];
    if (cur === undefined) rec[k] = v;
    else rec[k] = Array.isArray(cur) ? [...cur, v] : [cur, v];
  }
  return parseFilters(rec);
}

/** Slim programme record used by the client-side list (public/data/programs-index.json). */
export interface ProgrammeIndex {
  id: number;
  slug: string;
  name: string;
  university: string;
  city: string;
  degree: Degree;
  languageGroup: Programme["languageGroup"];
  beginning: string | null;
  tuition: { free: boolean; unknown?: boolean };
  uniAssist: boolean;
  categories: string[];
  deadlines: Deadline[];
  noDeadline: boolean;
  redFlags: string[];
  source: "daad" | "university";
  subject: string;
  fieldsOfStudy: string[];
}

export const CATEGORY_BLURBS: Record<string, string> = {
  "computer-science": "Software, AI, data science, cybersecurity, HCI",
  engineering: "Mechanical, electrical, civil, automotive, materials",
  business: "Management, finance, economics, MBA, logistics",
  "law-policy": "Law, LL.M., political science, public administration",
  agriculture: "Agricultural science, forestry, food technology, nutrition",
  "natural-sciences": "Physics, chemistry, biology, mathematics, geosciences",
  environment: "Environmental science, sustainability, climate, landscape",
  "medicine-health": "Public health, biomedical science, pharmacy, nursing",
  "social-education": "Sociology, psychology, education, social work, sport",
  humanities: "Languages, history, philosophy, media, cultural studies",
  "arts-architecture": "Architecture, design, fine arts, music, performing arts",
};

// ---------- deadlines ----------

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysUntil(dateISO: string, from = todayISO()): number {
  const a = Date.UTC(+from.slice(0, 4), +from.slice(5, 7) - 1, +from.slice(8, 10));
  const b = Date.UTC(+dateISO.slice(0, 4), +dateISO.slice(5, 7) - 1, +dateISO.slice(8, 10));
  return Math.round((b - a) / 86400000);
}

/** Next upcoming deadline (deadlines are stored sorted; roll past ones forward a year). */
export type Filterable = {
  name: string; university: string; city: string; degree: Degree; languageGroup: Programme["languageGroup"];
  beginning: string | null; tuition: { free: boolean; unknown?: boolean }; uniAssist: boolean; categories: string[];
  deadlines: Deadline[]; subject: string; fieldsOfStudy: string[];
};

export function nextDeadline(p: { deadlines: Deadline[] }, from = todayISO()): Deadline | null {
  if (!p.deadlines.length) return null;
  const rolled = p.deadlines.map((d) => {
    let date = d.date;
    // roll a yearly deadline that has already passed to next year
    while (daysUntil(date, from) < 0) {
      const y = +date.slice(0, 4) + 1;
      date = `${y}${date.slice(4)}`;
    }
    return { ...d, date };
  });
  rolled.sort((a, b) => a.date.localeCompare(b.date));
  return rolled[0];
}

export const PAGE_SIZES = [10, 25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 25;
export function pageSize(f: Filters): number {
  const n = Number(f.n);
  return (PAGE_SIZES as readonly number[]).includes(n) ? n : DEFAULT_PAGE_SIZE;
}

/** True when an application-period audience is for EU/EEA applicants only (not relevant to Pakistani students). */
export function isEuOnlyAudience(a: string): boolean {
  return /\b(EU|EEA)\b/.test(a) && !/non-?\s?eu/i.test(a) && !/\ball\b/i.test(a);
}

/** Human label for the intake a deadline belongs to, e.g. "Winter 2027/28 intake, starts October 2027". */
export function intakeLabel(semester: "winter" | "summer" | null, deadlineISO: string): string | null {
  if (!semester) return null;
  const y = +deadlineISO.slice(0, 4);
  const m = +deadlineISO.slice(5, 7);
  if (semester === "winter") {
    const start = m <= 9 ? y : y + 1; // winter semester starts in October
    return `Winter ${start}/${String(start + 1).slice(2)} intake, starts October ${start}`;
  }
  const start = m >= 4 ? y + 1 : y; // summer semester starts in April
  return `Summer ${start} intake, starts April ${start}`;
}

export type Urgency = "urgent" | "soon" | "open" | "unknown";

export function urgency(days: number | null): Urgency {
  if (days === null) return "unknown";
  if (days <= 30) return "urgent";
  if (days <= 90) return "soon";
  return "open";
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

// ---------- filtering ----------

export interface Filters {
  degree?: Degree | "";
  field?: string;
  q?: string;
  uni?: string[];
  city?: string;
  tuition?: "free" | "paid" | "";
  intake?: "winter" | "summer" | "";
  lang?: "english" | "";
  uniassist?: "no" | "";
  deadline?: "30" | "60" | "90" | "";
  sort?: "deadline" | "name" | "university" | "";
  page?: string;
  n?: string;
}

export function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const g = (k: string) => {
    const v = sp[k];
    return (Array.isArray(v) ? v[0] : v) ?? "";
  };
  const all = (k: string) => {
    const v = sp[k];
    const arr = Array.isArray(v) ? v : v ? [v] : [];
    return [...new Set(arr.map((x) => x.trim()).filter(Boolean))];
  };
  const degree = g("degree");
  return {
    degree: degree === "Bachelor" || degree === "Master" ? degree : "",
    field: g("field"),
    q: g("q").trim(),
    uni: all("uni"),
    city: g("city"),
    tuition: g("tuition") as Filters["tuition"],
    intake: g("intake") as Filters["intake"],
    lang: g("lang") as Filters["lang"],
    uniassist: g("uniassist") as Filters["uniassist"],
    deadline: g("deadline") as Filters["deadline"],
    sort: g("sort") as Filters["sort"],
    page: g("page"),
    n: g("n"),
  };
}

export function filterProgrammes<T extends Filterable>(all: T[], f: Filters, from = todayISO()): T[] {
  const q = f.q?.toLowerCase();
  let out = all.filter((p) => {
    if (f.degree && p.degree !== f.degree) return false;
    if (f.field && !p.categories.includes(f.field)) return false;
    if (f.uni && f.uni.length && !f.uni.includes(p.university)) return false;
    if (f.city && p.city !== f.city) return false;
    if (f.tuition === "free" && !p.tuition.free) return false;
    if (f.tuition === "paid" && p.tuition.free) return false;
    if (f.intake && !(p.beginning || "").toLowerCase().includes(f.intake)) return false;
    if (f.lang === "english" && p.languageGroup !== "English only") return false;
    if (f.uniassist === "no" && p.uniAssist) return false;
    if (f.deadline) {
      const nd = nextDeadline(p, from);
      if (!nd) return false;
      if (daysUntil(nd.date, from) > Number(f.deadline)) return false;
    }
    if (q) {
      const hay = `${p.name} ${p.university} ${p.city} ${p.subject} ${p.fieldsOfStudy.join(" ")}`.toLowerCase();
      if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  });
  const sort = f.sort || "name";
  if (sort === "deadline") {
    out = out
      .map((p) => ({ p, d: nextDeadline(p, from)?.date ?? "9999" }))
      .sort((a, b) => a.d.localeCompare(b.d) || a.p.name.localeCompare(b.p.name))
      .map((x) => x.p);
  } else if (sort === "university") {
    out = [...out].sort((a, b) => a.university.localeCompare(b.university) || a.name.localeCompare(b.name));
  }
  return out;
}

export function buildQuery(f: Filters, patch: Partial<Filters> = {}): string {
  const merged = { ...f, ...patch };
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (Array.isArray(v)) v.forEach((x) => x && sp.append(k, x));
    else if (v) sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function topCities(all: { city: string }[], n = 40): { city: string; count: number }[] {
  const m = new Map<string, number>();
  for (const p of all) m.set(p.city, (m.get(p.city) || 0) + 1);
  return [...m.entries()].map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count || a.city.localeCompare(b.city)).slice(0, n);
}

export function universities(all: { university: string }[]): { name: string; count: number }[] {
  const m = new Map<string, number>();
  for (const p of all) m.set(p.university, (m.get(p.university) || 0) + 1);
  return [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
}

const PREFERRED_UNIS = [
  "Technical University of Munich",
  "RWTH Aachen University",
  "Technische Universität Berlin",
  "University of Stuttgart",
  "Paderborn University",
  "Heidelberg University",
  "Karlsruhe Institute of Technology",
  "TU Dresden",
];

/** Quick picks: well-known public universities that exist in the data, topped up by programme count. */
export function topUniversities(all: { university: string }[], n = 4): { name: string; count: number }[] {
  const list = universities(all);
  const byName = new Map(list.map((u) => [u.name, u]));
  const picks: { name: string; count: number }[] = [];
  for (const name of PREFERRED_UNIS) { const u = byName.get(name); if (u && picks.length < n) picks.push(u); }
  for (const u of [...list].sort((a, b) => b.count - a.count)) { if (picks.length >= n) break; if (!picks.includes(u)) picks.push(u); }
  return picks;
}

export function stats(all: Programme[]) {
  return {
    programmes: all.length,
    bachelors: all.filter((p) => p.degree === "Bachelor").length,
    masters: all.filter((p) => p.degree === "Master").length,
    universities: new Set(all.map((p) => p.university)).size,
    cities: new Set(all.map((p) => p.city)).size,
    free: all.filter((p) => p.tuition.free).length,
  };
}
