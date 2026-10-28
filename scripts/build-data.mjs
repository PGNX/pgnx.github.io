// Turns data/daad-raw.json into src/data/programs.json (clean, site-ready).
import fs from "node:fs";
import path from "node:path";
import { SUBJECT_GROUPS, FOS } from "./daad-taxonomy.mjs";
import * as cheerio from "cheerio";

const RAW = path.resolve("data/daad-raw.json");
const OVERRIDES = path.resolve("data/overrides.json"); // PGNX volunteer corrections, keyed by id
const OUT = path.resolve("src/data/programs.json");
const EXTRA_DIR = path.resolve("data/extra"); // university-verified programmes (results-*.json + candidates.json)

// PGNX categories. A programme can belong to several.
export const CATEGORIES = [
  { id: "computer-science", name: "Computer Science & IT", fos: ["Computer Science"] },
  { id: "engineering", name: "Engineering", group: "Engineering Sciences", excludeFos: ["Architecture", "Spatial Planning"], fos: ["Engineering Physics"] },
  { id: "business", name: "Business, Economics & Management", fos: ["Economic Sciences", "Engineering and Management"] },
  { id: "law-policy", name: "Law & Public Policy", group: "Public Administration", fos: ["Law", "Political Sciences"] },
  { id: "agriculture", name: "Agriculture, Forestry & Food", group: "Agricultural and Forest Sciences", fos: ["Food Technology", "Nutritional Sciences"] },
  { id: "natural-sciences", name: "Natural Sciences & Mathematics", group: "Mathematics, Natural Sciences", excludeFos: ["Computer Science"] },
  { id: "environment", name: "Environment & Sustainability", fos: ["Environmental Sciences", "Environmental Protection and Disposal Technology", "Environmental and Landscape Design", "Geography", "Forest and Wood Management"] },
  { id: "medicine-health", name: "Medicine & Health", group: "Medicine, Health Sciences", fos: ["Technical Health Systems", "Pharmacy, Pharmaceutical Engineering", "Neurosciences", "Bioengineering"] },
  { id: "social-education", name: "Social Sciences & Education", group: "Humanities and Social Sciences", fos: ["Teaching Degrees"], groups: ["Teaching Degrees"] },
  { id: "humanities", name: "Humanities, Languages & Media", group: "Language and Cultural Studies" },
  { id: "arts-architecture", name: "Arts, Design & Architecture", group: "Art, Music, Design", fos: ["Architecture", "Spatial Planning"] },
];

const MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"];

// Convert a stored DAAD field HTML fragment to text that keeps structure:
// paragraphs become lines, list items become lines starting with "• ".
function textFromHtml(html) {
  if (!html) return null;
  const $ = cheerio.load(`<div id="root">${html}</div>`);
  const root = $("#root");
  root.find("picture, img, script, style").remove();
  root.find("br, hr").replaceWith("\n");
  root.find("li").each((_, li) => { $(li).prepend("\n• "); $(li).append("\n"); });
  root.find("p, div, tr, h1, h2, h3, h4, h5, h6, dt, dd, ul, ol, table").each((_, b) => { $(b).prepend("\n"); $(b).append("\n"); });
  return root.text().replace(/[ \t\r\f\v\u00a0]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{2,}/g, "\n").trim();
}

// Clean a text field that came out of DAAD HTML: drop stray tag-like text (escaped <picture>/<img>), blank lines, orphan "PDF Download" labels.
function cleanText(s) {
  if (!s) return s;
  return s
    .replace(/<\/?[a-z!][^>]*>/gi, " ")
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l && !/^(pdf download|download pdf|zum download)$/i.test(l))
    .join("\n")
    .replace(/^•\s*([^\n]*)$/, "$1"); // a lone single-line bullet is just a value
}

function stripHtml(s) {
  return (s || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

function categoriesFor(list) {
  const fos = new Set(list.fieldsOfStudy || []);
  const groups = new Set(list.subjectGroups || []);
  const out = [];
  for (const c of CATEGORIES) {
    let hit = false;
    if (c.group && groups.has(c.group)) {
      // programme is in the group, unless ALL its fos are excluded ones
      const excl = new Set(c.excludeFos || []);
      const nonExcluded = [...fos].filter((f) => !excl.has(f));
      // only count the group hit if at least one fos of this programme isn't excluded OR it has no fos info
      hit = fos.size === 0 || nonExcluded.length > 0 ? true : false;
      if (hit && excl.size && [...fos].every((f) => excl.has(f))) hit = false;
    }
    if (!hit && c.groups && c.groups.some((g) => groups.has(g))) hit = true;
    if (!hit && c.fos && c.fos.some((f) => fos.has(f))) hit = true;
    if (hit) out.push(c.id);
  }
  return out.length ? out : ["other"];
}

// ---------- application period parsing ----------
const MONTH_RE = "(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)";
function monthIndex(name) {
  const n = name.toLowerCase().slice(0, 3);
  return MONTHS.findIndex((m) => m.startsWith(n)) + 1;
}
function lastDay(month) { return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1]; }

function extractDates(body) {
  const dates = [];
  const seen = new Set();
  const push = (day, month, year) => {
    if (!month || !day || day > 31) return;
    const k = `${day}-${month}-${year || ""}`;
    if (seen.has(k)) return;
    seen.add(k);
    dates.push({ day, month, year: year ? Number(year) : null });
  };
  let m;
  // 15 July 2027 / 15th of July / 15. Juli
  const r1 = new RegExp(`(\\d{1,2})(?:st|nd|rd|th)?\\.?(?:\\s+of)?\\s+${MONTH_RE}\\.?(?:,?\\s+(\\d{4}))?`, "gi");
  while ((m = r1.exec(body))) push(Number(m[1]), monthIndex(m[2]), m[3]);
  // July 15, 2027 / July 15th
  const r2 = new RegExp(`${MONTH_RE}\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?(?!\\s*[-–]\\s*\\d)`, "gi");
  while ((m = r2.exec(body))) push(Number(m[2]), monthIndex(m[1]), m[3]);
  // end of May / mid-February / beginning of March
  const r3 = new RegExp(`(end|mid|middle|beginning|start)(?:\\s+of|-)?\\s*${MONTH_RE}(?:\\s+(\\d{4}))?`, "gi");
  while ((m = r3.exec(body))) {
    const mo = monthIndex(m[2]);
    const w = m[1].toLowerCase();
    push(w === "end" ? lastDay(mo) : w.startsWith("mid") ? 15 : 1, mo, m[3]);
  }
  // 15.07.2027 / 15/07/2027
  const r4 = /(\d{1,2})[./](\d{1,2})[./](\d{4})/g;
  while ((m = r4.exec(body))) push(Number(m[1]), Number(m[2]), m[3]);
  return dates;
}

function detectAudience(s) {
  if (/non-?\s?eu/i.test(s)) return "non-EU countries";
  if (/\b(EU|EEA)\b/.test(s) && /(citizen|resident|applicant|countr|national|student|member)/i.test(s)) return "EU countries";
  if (/\b(international|foreign|overseas|visa)\b/i.test(s)) return "non-EU countries";
  if (/all (countries|applicants|students)/i.test(s)) return "all countries";
  return null;
}

function semesterOf(s) {
  const w = /winter/i.test(s), su = /summer/i.test(s);
  return w && !su ? "winter" : su && !w ? "summer" : null;
}

// Parse the "Application periods" text into structured deadlines.
// Returns [{ audience, semester, text, dates: [{day, month, year?}] }]
function parseApplicationPeriods(text) {
  if (!text) return [];
  text = text.replace(/•\s*/g, ""); // bullet markers are for display only
  const flat = text.replace(/\n/g, " ¶ ").replace(/\s+/g, " ").trim();
  const clean = (s) => s.replace(/\s*¶\s*/g, " ").replace(/\s+/g, " ").trim();
  if (/^(this programme has no deadline|there (are|is) no (application )?deadline)/i.test(clean(flat))) return [];
  const out = [];

  if (/The following is valid for applicants from:/i.test(flat)) {
    const blocks = flat.split(/The following is valid for applicants from:\s*/i).map((s) => s.trim()).filter(Boolean);
    for (const b of blocks) {
      let audience = "all countries";
      let rest = b;
      const m = b.match(/^([A-Za-z¶\/ ,-]{2,120}?)(?=\s+For the |\s*$)/i);
      if (m) { audience = m[1].split("¶").map((x) => x.trim()).filter(Boolean).join(", "); rest = b.slice(m[0].length).trim(); }
      rest = clean(rest);
      const chunks = rest.split(/(?=For the (?:winter|summer) semester)/i).map((s) => s.trim()).filter(Boolean);
      for (const ch of chunks) {
        const sm = ch.match(/^For the (winter|summer) semester[:\s]*/i);
        const semester = sm ? sm[1].toLowerCase() : semesterOf(ch);
        const body = sm ? ch.slice(sm[0].length).trim() : ch;
        out.push({ audience, semester, text: body, dates: extractDates(body) });
      }
    }
    return out;
  }

  // Free text: go line by line (also split on " / " and ";"), a header line like "Non-EU citizens:" applies to following lines.
  const lines = text.split(/\n|;|\s\/\s/).map((s) => s.trim()).filter(Boolean);
  let current = null;
  for (const line of lines) {
    const dates = extractDates(line);
    const aud = detectAudience(line);
    if (!dates.length) { if (aud) current = aud; continue; }
    out.push({ audience: aud || current || "all applicants", semester: semesterOf(line), text: line, dates });
  }
  return out;
}

// Next upcoming instance of a (day, month[, year]) relative to `now`.
function nextDate({ day, month, year }, now) {
  if (year) return new Date(Date.UTC(year, month - 1, day));
  let y = now.getUTCFullYear();
  let d = new Date(Date.UTC(y, month - 1, day));
  if (d < now) d = new Date(Date.UTC(y + 1, month - 1, day));
  return d;
}

function nonEuDeadlines(periods, now) {
  // Prefer non-EU / all-countries blocks (Pakistani applicants are non-EU).
  const pref = periods.filter((p) => /non-?eu|all/i.test(p.audience));
  const use = pref.length ? pref : periods;
  const res = [];
  for (const p of use) {
    if (!p.dates.length) continue;
    const end = p.dates[p.dates.length - 1]; // the last date in a range is the deadline
    const d = nextDate(end, now);
    res.push({ semester: p.semester, audience: p.audience, date: d.toISOString().slice(0, 10), text: p.text });
  }
  res.sort((a, b) => a.date.localeCompare(b.date));
  // dedupe identical semester+date entries
  const seen = new Set();
  return res.filter((r) => { const k = `${r.semester}|${r.date}`; if (seen.has(k)) return false; seen.add(k); return true; });
}

function tuitionInfo(list, fields) {
  const raw = fields["Tuition fees per semester"]?.value || list.tuitionFees || "";
  const txt = raw.replace(/\n/g, " ").trim();
  const free = /^(none|no tuition fees?|no)\b/i.test(txt) || /no tuition fees/i.test(txt);
  const amt = txt.match(/([\d.,]+)\s*EUR/i);
  const amount = amt ? Number(amt[1].replace(/[.,](?=\d{3}\b)/g, "").replace(",", ".")) : null;
  return { free, text: txt, amountPerSemester: free ? 0 : amount };
}

function slugify(s) {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}


// ---------- university-verified extra programmes ----------
// Name-based category rules for programmes added from university websites (CSV badges are unreliable).
const KEYWORD_CATS = [
  ["computer-science", /computer science|computer engineering|informatic|software|data science|data and computer|artificial intelligence|\bai\b|machine learning|cyber|it security|information systems|internet of things|\biot\b|devops|cloud|embedded|robotic|autonomous systems|digital health|interactive media|geodata|geoinformat|computational|smart systems|information technology|information and communication/i],
  ["engineering", /engineering|non-destructive|simulation sciences|research and innovation|electrical|electronic|semiconductor|mechatronic|manufacturing|mechanical|communication systems|power systems|energy|materials|functional safety|process systems|automation|technical innovation|microelectronic|geodesy/i],
  ["business", /business|management|financ|\bmba\b|entrepreneur|innovation management|logistic|supply chain|economic|leadership|industrial engineering/i],
  ["natural-sciences", /mathemat|physic|chemi|biolog|biodiversity|biochem|nanotechnolog|quantum|cartograph|geodesy|geoinformat|statistic/i],
  ["environment", /environment|sustainab|climate|bioeconomy|hydro-environmental|renewable/i],
  ["medicine-health", /biomedical|medical|health|pharma|medicine|sports and medicine|biotech/i],
  ["social-education", /psycholog|sociolog|education|social|sport(?!s and medicine)/i],
  ["humanities", /language|linguistic|cultur|history|philosoph|media studies|communication studies/i],
  ["arts-architecture", /design|architecture|art\b|music/i],
];
function categoriesForName(name) {
  const out = [];
  for (const [cat, re] of KEYWORD_CATS) if (re.test(name)) out.push(cat);
  return out.length ? out.slice(0, 3) : ["other"];
}

function loadExtra(now, slugs) {
  if (!fs.existsSync(EXTRA_DIR)) return [];
  const cands = fs.existsSync(path.join(EXTRA_DIR, "candidates.json")) ? JSON.parse(fs.readFileSync(path.join(EXTRA_DIR, "candidates.json"), "utf8")) : [];
  const byId = Object.fromEntries(cands.map((c) => [String(c.id), c]));
  const out = [];
  for (const f of fs.readdirSync(EXTRA_DIR).filter((f) => /^results-\d+\.json$/.test(f)).sort()) {
    let arr;
    try { arr = JSON.parse(fs.readFileSync(path.join(EXTRA_DIR, f), "utf8")); } catch (e) { console.warn(`skip ${f}: ${e.message}`); continue; }
    for (const r of arr) {
      if (!r || !r.include || !r.courseWebsite || !r.name || !r.university) continue;
      // "not verified" / "unknown" style placeholders from the research step become null
      const nv = (v) => (typeof v === "string" && /^(not verified|unknown|n\/a|not stated|not found|unclear)/i.test(v.trim())) ? null : v;
      for (const k of ["degreeTitle", "duration", "beginning", "languageNote", "tuitionText", "semesterContribution", "deadlineNote", "englishRequirement", "germanRequirement", "admissionRequirements", "description"]) r[k] = nv(r[k]);
      const c = byId[String(r.id)] || {};
      const cats = categoriesForName(`${r.name} ${c.title || ""}`);
      const tax = { fieldsOfStudy: [], subjectGroups: [] };
      const periods = (r.deadlines || []).filter((d) => d && d.day && d.month).map((d) => ({
        audience: d.audience === "EU" ? "EU countries" : d.audience === "non-EU" ? "non-EU countries" : "all countries",
        semester: d.semester || null,
        text: d.text || "",
        dates: [{ day: Number(d.day), month: Number(d.month), year: d.year ? Number(d.year) : null }],
      }));
      const deadlines = nonEuDeadlines(periods, now);
      const tuitionAmt = r.tuitionNonEuPerSemester == null ? null : Number(r.tuitionNonEuPerSemester);
      const free = tuitionAmt === 0 || (tuitionAmt == null && /\b(no|none|free)\b/i.test(r.tuitionText || ""));
      const uniAssist = /uni-?assist/i.test(`${r.applyVia || ""} ${r.applyUrl || ""} ${r.deadlineNote || ""}`);
      let slug = slugify(`${r.name}-${r.university}`);
      if (slugs.has(slug)) slug = `${slug}-x${r.id}`;
      slugs.add(slug);
      const lang = /german/i.test(r.languageNote || "") && !/no german|without german|none/i.test(r.languageNote || "") ? "German & English" : "English only";
      out.push({
        id: 900000 + Number(r.id),
        slug,
        source: "university",
        name: r.name,
        university: r.university,
        city: r.city || c.city || "",
        degree: "Master",
        degreeTitle: r.degreeTitle || null,
        languageGroup: lang,
        languages: ["English"],
        languageNote: r.languageNote || null,
        duration: r.duration || null,
        beginning: r.beginning || null,
        mode: null, studyMode: null,
        subject: "",
        fieldsOfStudy: tax.fieldsOfStudy,
        subjectGroups: tax.subjectGroups,
        categories: cats,
        tuition: { free, unknown: !free && tuitionAmt == null && !(r.tuitionText || "").trim(), text: r.tuitionText || (free ? "None" : ""), amountPerSemester: free ? 0 : tuitionAmt },
        semesterContribution: r.semesterContribution || null,
        costsOfLiving: null, funding: null,
        applicationPeriodsText: periods.map((p) => `${p.audience}: ${p.semester ? p.semester + " semester: " : ""}${p.text}`).join("\n") || null,
        applicationPeriods: periods,
        deadlines,
        deadlineNote: r.deadlineNote || null,
        daadDeadlineSummary: "",
        applyVia: r.applyVia && r.applyVia !== "unknown" ? (r.applyVia === "uni-assist" ? "Apply via uni-assist." : r.applyVia === "university portal" ? "Apply via the university's online portal." : "Apply by email.") : null,
        applyLinks: r.applyUrl ? [r.applyUrl] : [],
        uniAssist,
        admissionRequirements: r.admissionRequirements || null,
        englishRequirement: r.englishRequirement || null,
        germanRequirement: r.germanRequirement || null,
        languageExemptions: null,
        description: r.description || null,
        courseOrganisation: null, internships: null, jointDegree: null, partTimeJobs: null, accommodation: null, supportServices: null,
        courseWebsite: r.courseWebsite,
        uniWebsite: r.uniWebsite || null,
        contactEmail: null, contactName: null, uniLogo: null,
        daadUrl: r.daadUrl || null,
        sources: r.sources || [],
        confidence: r.confidence || "medium",
        fetchedAt: now.toISOString(),
        verifiedAt: null,
        verifiedBy: null,
        notes: null,
      });
    }
  }
  return out;
}


// ---------- highlights: key facts students must not miss ----------
function splitSentences(text) {
  if (!text) return [];
  // split on sentence ends and newlines, but not after "i.e." / "e.g." / "approx." / "min."
  return text.split(/(?<!\bi\.e\.)(?<!\be\.g\.)(?<!\bapprox\.)(?<!\bmin\.)(?<!\bmax\.)(?<=[.!?])\s+|\n+/).map((x) => x.replace(/^•\s*/, "").trim()).filter(Boolean);
}
function clip(x) { return x.length > 240 ? x.slice(0, 237) + "…" : x; }
function sentencesWith(text, re) {
  return splitSentences(text).filter((x) => re.test(x)).map(clip);
}
const NEG = /\b(not required|no gre|not needed|do not need|don't need|not necessary|optional|recommended|waive|waived|exempt|not mandatory|no longer required|is not a requirement|without (a )?gre|exception)\b/i;

function highlightsFor(p) {
  const out = [];
  const reqText = [p.admissionRequirements, p.languageExemptions, p.applyVia, p.description, p.deadlineNote].filter(Boolean).join("\n");
  const push = (level, label, detail) => { if (!out.some((o) => o.label === label)) out.push({ level, label, detail: detail || null }); };

  // GRE / GMAT
  const allSents = splitSentences(reqText);
  for (const test of ["GRE", "GMAT"]) {
    const re = new RegExp(`\\b${test}\\b`, "i");
    const required = [], conditional = [];
    allSents.forEach((x, i) => {
      if (!re.test(x)) return;
      if (NEG.test(x)) conditional.push(clip(x));
      else {
        required.push(clip(x));
        // look at the next few sentences: score details belong to the requirement, an exception/waiver becomes conditional
        for (let j = i + 1; j <= i + 3 && j < allSents.length; j++) {
          const nx = allSents[j];
          if (re.test(nx)) break;
          if (/\b(exception|waiv|exempt|unless|not required|do not need|don't need)\b/i.test(nx)) { conditional.push(clip(nx)); break; }
          if (/\b(required|minimum) (overall )?scores?\b|\bat least \d/i.test(nx)) required.push(clip(nx));
        }
      }
    });
    if (!required.length && !conditional.length) continue;
    if (required.length) push("red", `${test} required`, required.join(" "));
    if (conditional.length) push(required.length ? "amber" : "green", required.length ? `${test} waiver / exception` : `${test} not required`, conditional.join(" "));
  }

  // German language
  const g = p.germanRequirement || "";
  if (g && !/no minimum|none|not required|no german|not necessary|no requirement/i.test(g) && /\b(A1|A2|B1|B2|C1|C2|DSH|TestDaF|required)\b/i.test(g)) push("red", "German language required", g);

  // Minimum grade / GPA
  const grade = sentencesWith(reqText, /\b(grade|gpa|cgpa|average)\b[^.]{0,80}\b\d[.,]\d\b|\b\d[.,]\d\b[^.]{0,40}\b(grade|gpa|cgpa|german grading)/i);
  if (grade.length) push("amber", "Grade requirement", grade.slice(0, 2).join(" "));

  // Work experience
  const work = sentencesWith(reqText, /\b(work|professional|practical) experience\b/i).filter((x) => /\b(year|month|required|minimum|at least)\b/i.test(x) && !/not required|no .{0,20}experience/i.test(x));
  if (work.length) push("red", "Work experience required", work[0]);

  // APS certificate
  if (/\bAPS\b/.test(reqText)) push("red", "APS certificate", sentencesWith(reqText, /\bAPS\b/)[0]);

  // Tuition
  if (p.tuition.free) push("green", "No tuition fee", p.semesterContribution ? `Semester contribution: ${p.semesterContribution.split("\n")[0]}` : null);
  else if (p.tuition.amountPerSemester) push("amber", `Tuition ${p.tuition.amountPerSemester.toLocaleString("en-GB")} EUR per semester`, p.tuition.text.split("\n")[0]);
  else if (p.tuition.text && !p.tuition.unknown) push("amber", "Tuition fee charged", p.tuition.text.split("\n")[0]);

  // English scores
  const e = p.englishRequirement || "";
  const scores = [];
  const m1 = e.match(/IELTS[^\d]{0,30}(\d(?:[.,]\d)?)/i); if (m1) scores.push(`IELTS ${m1[1].replace(",", ".")}`);
  const m2 = e.match(/TOEFL[^\d]{0,40}(\d{2,3})/i); if (m2) scores.push(`TOEFL ${m2[1]}`);
  const lvl = e.match(/\b(B2|C1|C2)\b/); 
  if (scores.length || lvl) push("neutral", "English", [lvl ? `${lvl[1]} level` : null, ...scores].filter(Boolean).join(" · "));
  else if (/no minimum|not required|none/i.test(e) && e) push("green", "No English certificate required", e.split("\n")[0]);

  // uni-assist
  if (p.uniAssist) push("amber", "Apply via uni-assist", "uni-assist needs extra time and a handling fee. Its deadline counts, not the university's.");

  return out;
}

// ---------- ECTS requirements: "at least 30 ECTS in Mathematics" -> { credits, subject } ----------
const E_UNIT = "(?:ECTS(?:\\s*(?:credit\\s*)?points?|\\s*credits?)?|credit\\s*points?|credits?|\\bCP\\b|\\bLP\\b)";
const E_QUAL = "(?:at\\s+least|minimum\\s+of|a\\s+minimum\\s+of|minimum|min\\.?|no\\s+fewer\\s+than|more\\s+than|≥|>=)?\\s*";
const E_STOP = "(?=,|;|\\.|•|\\(|\\)|\\s+(?:and|or)\\s+(?:at\\s+least|min|a\\s+minimum|\\d)|\\s+of\\s+which|\\s+(?:is|are|must|should|has|have|will)\\b|$)";
const E_GENERIC = /^(total|overall|in total|credits?|ects|points?|the|a|an|which|that|them|this|these|those|it|each|per semester|semester)$/i;
// subjects that are really clauses, not subjects
const E_BAD_START = /^(during|by|with|without|should|must|shall|these|those|the (bachelor|master|first|previous|prior|entire|whole)|a larger|a total|across|earned|taken|acquired|completed|obtained|which|that|per|in total|within the|after|before|prior|over|throughout|towards|to be|have|has|had|is|are|was|were|will|can|may|or|and|at|if|when|where|while|as|so|than|then|there|here|your|his|her|their|our|you|we|they|at least|minimum|about|approximately|roughly|more|less|not|no|only|also|plus|including|e\.g|i\.e|for example|such as|equivalent)\b/i;
function cleanSubject(x) {
  x = x.replace(/^(the\s+)?(fields?|areas?|subjects?|modules?|courses?|topics?|disciplines?)\s+(of|in)\s+/i, "")
       .replace(/^(in|of|from|for|on|covering|related\s+to|within)\s+/i, "")
       .replace(/\s+(or|and|and\/or|in|of)\s*$/i, "").replace(/[\s,;:.]+$/, "").replace(/^[\s,;:.]+/, "").replace(/\s+/g, " ").trim();
  if (x.length > 70) x = x.slice(0, 67).replace(/\s+\S*$/, "") + "…";
  return x;
}
function parseEcts(text) {
  if (!text) return { items: [], total: null };
  const t = text.replace(/\s+/g, " ");
  const items = []; const seen = new Set();
  const push = (credits, subject, src) => {
    const sub = cleanSubject(subject); const n = Number(credits);
    if (!sub || sub.length < 3 || E_GENERIC.test(sub) || E_BAD_START.test(sub) || /^\d/.test(sub) || !n || n > 150) return;
    if (!/[a-z]{3}/i.test(sub) || /\b(semester|studies|programme|program|degree|course of study)\b$/i.test(sub) && !/\b(in|of)\b/i.test(sub)) return;
    const k = `${n}|${sub.toLowerCase()}`; if (seen.has(k)) return; seen.add(k);
    items.push({ credits: n, subject: sub, text: src.trim().slice(0, 200) });
  };
  let m;
  // A: "at least 30 ECTS in Business Administration", "28 ECTS mathematics"
  const rA = new RegExp(`${E_QUAL}(\\d{1,3})\\s*${E_UNIT}\\s*(?:credits?|points?)?\\s*(?:in|of|from|for|on|covering|related\\s+to|within)?\\s+([A-Za-z][^.;•(),]{2,70}?)${E_STOP}`, "gi");
  while ((m = rA.exec(t))) push(m[1], m[2], m[0]);
  // B: "Mathematics: 28 ECTS", "Mechanics (18 CP)"
  const rB = new RegExp(`([A-Z][A-Za-z&/\\- ]{2,60}?)\\s*[:(]\\s*${E_QUAL}(\\d{1,3})\\s*${E_UNIT}`, "g");
  while ((m = rB.exec(t))) push(m[2], m[1], m[0]);
  // C: "Chemistry (min. 4)" when the surrounding text talks about credits
  if (/credits?|ECTS/i.test(t)) {
    const rC = /([A-Z][A-Za-z&/\- ]{2,40}?)\s*\(\s*(?:min\.?|at least|minimum)\s*(\d{1,3})\s*\)/g;
    while ((m = rC.exec(t))) push(m[2], m[1], m[0]);
  }
  // total size of the prior degree: "180 ECTS", "at least 210 credits"
  let total = null;
  const rT = new RegExp(`${E_QUAL}(1[5-9]\\d|2[0-4]\\d)\\s*${E_UNIT}`, "gi");
  while ((m = rT.exec(t))) { const n = Number(m[1]); if (!total || n < total) total = n; }
  return { items: items.slice(0, 10), total };
}

function main() {
  const raw = JSON.parse(fs.readFileSync(RAW, "utf8"));
  const overridesRaw = fs.existsSync(OVERRIDES) ? JSON.parse(fs.readFileSync(OVERRIDES, "utf8")) : {};
  const overrides = Object.fromEntries(Object.entries(overridesRaw).filter(([k]) => !k.startsWith("_")));
  const now = new Date();
  const programmes = [];
  const slugs = new Set();
  for (const [id, p] of Object.entries(raw.programmes)) {
    const list = p.list;
    const f = p.detail?.fields || {};
    const g = (k) => cleanText(f[k]?.html ? textFromHtml(f[k].html) : f[k]?.value) || null;
    const links = (k) => f[k]?.links || [];
    const periods = parseApplicationPeriods(g("Application periods"));
    const deadlines = nonEuDeadlines(periods, now);
    const tuition = tuitionInfo(list, f);
    const applyVia = g("Submit application via");
    let slug = slugify(`${list.courseName}-${list.academy}`);
    if (slugs.has(slug)) slug = `${slug}-${id}`;
    slugs.add(slug);
    const base = {
      id: Number(id),
      slug,
      source: "daad",
      name: list.courseName,
      university: list.academy,
      city: list.city,
      degree: list.degree, // Bachelor | Master
      degreeTitle: g("Degree"),
      languageGroup: list.langGroup, // "English only" | "German & English"
      languages: list.languages,
      languageNote: g("Languages"),
      duration: g("Programme duration") || list.programmeDuration,
      beginning: g("Beginning") || list.beginning,
      mode: g("Full-time / part-time"),
      studyMode: g("Mode of study"),
      subject: list.subject,
      fieldsOfStudy: list.fieldsOfStudy,
      subjectGroups: list.subjectGroups,
      categories: categoriesFor(list),
      tuition,
      semesterContribution: g("Semester contribution"),
      costsOfLiving: g("Costs of living"),
      funding: g("Funding opportunities within the university"),
      applicationPeriodsText: g("Application periods"),
      applicationPeriods: periods,
      deadlines, // next upcoming, non-EU preferred
      daadDeadlineSummary: stripHtml(list.applicationDeadline),
      applyVia,
      applyLinks: links("Submit application via"),
      uniAssist: /uni-?assist/i.test(applyVia || ""),
      admissionRequirements: g("Academic admission requirements"),
      englishRequirement: g("English language skills"),
      germanRequirement: g("German language skills"),
      languageExemptions: g("Language requirements exemptions"),
      description: g("Description/content"),
      courseOrganisation: g("Course organisation"),
      internships: g("Integrated internships"),
      jointDegree: g("Joint degree / double degree programme"),
      partTimeJobs: g("Possibility of finding part-time employment"),
      accommodation: g("Accommodation"),
      supportServices: g("Support for international students and doctoral candidates"),
      courseWebsite: p.detail?.courseWebsite ? p.detail.courseWebsite.replace(/[?&]utm_[^&]+/g, "").replace(/\?$/, "") : null,
      uniWebsite: p.detail?.uniWebsite || null,
      contactEmail: p.detail?.emails?.[0] || null,
      contactName: p.detail?.contactName || null,
      uniLogo: p.detail?.logo || null,
      daadUrl: `https://www2.daad.de${list.link}`,
      fetchedAt: p.detail?.fetchedAt || raw.fetchedAt,
      verifiedAt: null,
      verifiedBy: null,
      notes: null,
    };
    programmes.push({ ...base, ...(overrides[id] || {}) });
  }
  const extras = loadExtra(now, slugs);
  programmes.push(...extras);
  console.log(`university-verified extras: ${extras.length}`);
  for (const p of programmes) { p.highlights = highlightsFor(p); p.ects = parseEcts(p.admissionRequirements); }
  programmes.sort((a, b) => a.name.localeCompare(b.name));
  const counts = {};
  for (const p of programmes) for (const c of p.categories) counts[c] = (counts[c] || 0) + 1;
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ builtAt: now.toISOString(), source: "DAAD International Programmes in Germany + university websites", categories: CATEGORIES.map(({ id, name }) => ({ id, name, count: counts[id] || 0 })), programmes }));
  // slim index for the client-side list (GitHub Pages has no server)
  const INDEX = path.resolve("public/data/programs-index.json");
  fs.mkdirSync(path.dirname(INDEX), { recursive: true });
  const index = programmes.map((p) => ({
    id: p.id, slug: p.slug, name: p.name, university: p.university, city: p.city, degree: p.degree,
    languageGroup: p.languageGroup, beginning: p.beginning, tuition: { free: p.tuition.free, unknown: p.tuition.unknown || undefined },
    uniAssist: p.uniAssist, categories: p.categories, deadlines: p.deadlines,
    noDeadline: /no deadline/i.test(p.daadDeadlineSummary || ""),
    redFlags: (p.highlights || []).filter((h) => h.level === "red").map((h) => h.label),
    source: p.source, subject: p.subject, fieldsOfStudy: p.fieldsOfStudy,
  }));
  fs.writeFileSync(INDEX, JSON.stringify({ builtAt: now.toISOString(), programmes: index }));
  console.log(`built ${programmes.length} programmes -> ${OUT}; client index -> ${INDEX} (${Math.round(fs.statSync(INDEX).size / 1024)} KB)`);
  console.log(counts);
  const withDl = programmes.filter((p) => p.deadlines.length).length;
  console.log(`with parsed deadline: ${withDl}; with course website: ${programmes.filter((p) => p.courseWebsite).length}; uni-assist: ${programmes.filter((p) => p.uniAssist).length}`);
}
main();
