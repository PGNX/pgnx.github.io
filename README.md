# PGNX Programmes

A community site by **Pak-German Nexus (PGNX)** that lists every English-taught Bachelor's and Master's programme in Germany, grouped by field, with application deadlines and links to the official programme pages.

Data source: the DAAD *International Programmes in Germany* database. This project is not affiliated with DAAD.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

## Refresh the data

```bash
npm run scrape       # pulls the DAAD list + every detail page -> data/daad-raw.json (~15 min)
npm run data         # builds src/data/programs.json from the raw file + data/overrides.json
```

`npm run refresh` runs both. Re-run every few months, or before each application season (summer intake deadlines cluster in Jan–Mar, winter intake in May–Jul).

## Volunteer corrections

Edit `data/overrides.json`. Keys are DAAD programme ids (the number at the end of the DAAD listing URL). Any field from `src/data/programs.json` can be overridden, for example:

```json
{
  "4722": {
    "verifiedAt": "2026-10-28",
    "verifiedBy": "Ali",
    "notes": "Non-EU deadline confirmed on the university site.",
    "courseWebsite": "https://math.rptu.de/en/studium/studiengaenge/msc/fvm"
  }
}
```

Then run `npm run data` and redeploy.

## Configuration

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_COMMUNITY_URL` – WhatsApp / Discord / Facebook group link shown on every page
- `NEXT_PUBLIC_REPORT_URL` – Google Form (or similar) for "Report wrong information"
- `NEXT_PUBLIC_CONTACT_EMAIL` – fallback contact if no report form

## Deploy

Vercel free tier works out of the box (`vercel` or connect the Git repo). Set the three env vars in the Vercel project settings.

## Structure

- `scripts/scrape-daad.mjs` – DAAD scraper (list API + detail HTML parsing)
- `scripts/build-data.mjs` – normalises data, parses deadlines, maps DAAD subjects to PGNX fields, applies overrides
- `src/lib/data.ts` – types, filtering, deadline helpers
- `src/app/` – pages: home, `/programs` (filterable list), `/programs/[slug]`, `/about`

## Programmes added from university websites

DAAD does not list every English-taught programme. `data/extra/` holds programmes that PGNX verified directly on university websites:

- `candidates.json` – the input list (from a third-party CSV, unreliable: hints only)
- `results-*.json` – verified entries, one object per programme (official URL, non-EU deadlines, tuition, requirements, confidence, sources)
- `REPORT.md` – what was added and what was excluded, with reasons

`npm run data` merges every `results-*.json` whose entries have `"include": true` into the site. Such programmes show a "Verified on university website" badge and "University website" as source. To add more programmes, append objects in the same shape to a new `results-N.json`.
