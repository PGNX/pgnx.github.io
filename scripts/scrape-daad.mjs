// Scrapes the DAAD "International Programmes in Germany" database.
// Output: data/daad-raw.json  (one entry per programme, with list fields + parsed detail fields)
// Usage: node scripts/scrape-daad.mjs [--details-only] [--limit N]
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { SUBJECT_GROUPS, FOS } from "./daad-taxonomy.mjs";

const BASE = "https://www2.daad.de";
const API = `${BASE}/deutschland/studienangebote/international-programmes/api/solr/en/search.json`;
const OUT = path.resolve("data/daad-raw.json");
const UA = "PGNX-Programs-Bot/0.1 (+community project; contact via site)";

const DEGREES = { 1: "Bachelor", 2: "Master" };
const LANGS = { 2: "English only", 4: "German & English" };

const args = process.argv.slice(2);
const detailsOnly = args.includes("--details-only");
const force = args.includes("--force");
const limitArg = args.indexOf("--limit");
const LIMIT = limitArg >= 0 ? Number(args[limitArg + 1]) : Infinity;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchRetry(url, { json = false } = {}, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Accept: json ? "application/json" : "text/html" } });
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      if (!res.ok) return null;
      return json ? await res.json() : await res.text();
    } catch (e) {
      const wait = 1500 * (i + 1) ** 2;
      console.warn(`  retry ${i + 1} for ${url.slice(0, 120)} (${e.message}), waiting ${wait}ms`);
      await sleep(wait);
    }
  }
  console.error(`  FAILED ${url}`);
  return null;
}

function qs(params) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (Array.isArray(v)) v.forEach((x) => p.append(`${k}[]`, x));
    else p.set(k, v);
  }
  return p.toString();
}

async function fetchAll(extra) {
  const all = [];
  const limit = 500;
  for (let offset = 0; ; offset += limit) {
    const url = `${API}?${qs({ degree: [1, 2], lang: [2, 4], sort: 4, display: "list", limit, offset, ...extra })}`;
    const d = await fetchRetry(url, { json: true });
    if (!d) break;
    all.push(...d.courses);
    if (all.length >= d.numResults || d.courses.length === 0) break;
    await sleep(300);
  }
  return all;
}

async function collectIdsByFacet(name, ids) {
  const map = {};
  for (const id of ids) {
    const rows = await fetchAll({ [name]: [id] });
    map[id] = rows.map((c) => c.id);
    console.log(`  ${name} ${id} -> ${rows.length}`);
    await sleep(200);
  }
  return map;
}

function text($, el) {
  return $(el).text().replace(/\s+/g, " ").trim();
}

function htmlToText($, el) {
  // Preserve line structure: block-ish tags and <br>/<hr> become newlines.
  const clone = $(el).clone();
  clone.find("br, hr").replaceWith("\n");
  clone.find("p, li, div, tr, h1, h2, h3, h4, h5, h6").each((_, b) => { $(b).prepend("\n"); $(b).append("\n"); });
  return clone.text().replace(/[ \t\r\f\v\u00a0]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{2,}/g, "\n").trim();
}

function parseDetail(html) {
  const $ = cheerio.load(html);
  const fields = {};
  $("dt.c-description-list__content").each((_, dt) => {
    const key = text($, dt);
    const dd = $(dt).next("dd");
    if (!key || !dd.length) return;
    const value = htmlToText($, dd);
    const links = [];
    dd.find("a[href]").each((_, a) => { const h = $(a).attr("href"); if (h && /^https?:/.test(h)) links.push(h); });
    if (!(key in fields)) fields[key] = { value, links, html: dd.html().replace(/\s+/g, " ").trim() };
  });
  const courseWebsite = $("a.c-contact__link.visitCourseWebsite, a.c-contact__link:contains('Course website')").first().attr("href") || null;
  const uniWebsite = $("p.c-contact__location--title a.c-contact__link").first().attr("href") || null;
  const emails = [];
  $("a[href^='mailto:']").each((_, a) => { const e = $(a).attr("href").replace("mailto:", "").trim(); if (e && !emails.includes(e)) emails.push(e); });
  const contactName = text($, $("h4.c-contact__asp").first());
  const institution = text($, $("h2.c-profile__title").first());
  const logo = $("div.c-profile__sidebar img").attr("data-src") || null;
  return { fields, courseWebsite, uniWebsite, emails, contactName, institution, logo: logo ? BASE + logo.replace(/^\/\.\./, "") : null };
}

async function main() {
  let raw = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : { fetchedAt: null, programmes: {} };

  if (!detailsOnly) {
    console.log("1) Listing programmes by degree × language…");
    const list = {};
    for (const degreeId of Object.keys(DEGREES)) {
      for (const langId of Object.keys(LANGS)) {
        const rows = await fetchAll({ degree: [degreeId], lang: [langId] });
        console.log(`  degree ${DEGREES[degreeId]} / ${LANGS[langId]} -> ${rows.length}`);
        for (const c of rows) list[c.id] = { ...c, degreeId: Number(degreeId), degree: DEGREES[degreeId], langId: Number(langId), langGroup: LANGS[langId] };
      }
    }
    console.log(`  total unique: ${Object.keys(list).length}`);

    console.log("2) Subject groups…");
    const sg = await collectIdsByFacet("subjectGroup", Object.keys(SUBJECT_GROUPS));
    console.log("3) Fields of study…");
    const fos = await collectIdsByFacet("fos", Object.keys(FOS));

    for (const [id, c] of Object.entries(list)) {
      c.subjectGroups = Object.entries(sg).filter(([, ids]) => ids.includes(Number(id))).map(([k]) => SUBJECT_GROUPS[k]);
      c.fieldsOfStudy = Object.entries(fos).filter(([, ids]) => ids.includes(Number(id))).map(([k]) => FOS[k]);
      raw.programmes[id] = { ...(raw.programmes[id] || {}), list: c };
    }
    raw.fetchedAt = new Date().toISOString();
    fs.writeFileSync(OUT, JSON.stringify(raw, null, 1));
    console.log("  saved list stage.");
  }

  console.log("4) Detail pages…");
  const ids = Object.keys(raw.programmes).filter((id) => force || !raw.programmes[id].detail).slice(0, LIMIT);
  console.log(`  ${ids.length} to fetch`);
  let done = 0;
  const CONC = 4;
  async function worker() {
    while (ids.length) {
      const id = ids.shift();
      const url = `${BASE}${raw.programmes[id].list.link}`;
      const html = await fetchRetry(url);
      if (html) raw.programmes[id].detail = { ...parseDetail(html), url, fetchedAt: new Date().toISOString() };
      done++;
      if (done % 25 === 0) { fs.writeFileSync(OUT, JSON.stringify(raw, null, 1)); console.log(`  ${done} done`); }
      await sleep(250);
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));
  fs.writeFileSync(OUT, JSON.stringify(raw, null, 1));
  console.log(`Done. ${Object.keys(raw.programmes).length} programmes in ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
