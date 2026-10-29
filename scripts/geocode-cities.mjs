// Geocodes every city in the programme data with Nominatim (1 request/second, cached in data/geo/cities.json).
import fs from "node:fs";
const programmes = JSON.parse(fs.readFileSync("src/data/programs.json", "utf8")).programmes;
const OUT = "data/geo/cities.json";
const cache = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
const cities = [...new Set(programmes.map((p) => p.city))].filter(Boolean);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const city of cities) {
  if (cache[city]?.state) continue; // also (re)fetch entries that have no state yet
  const q = city.replace(/\s*\(.*?\)\s*/g, " ").split(/\s*[\/,;]\s*|\s+and\s+|\s+&\s+|\s+b\.\s+/)[0].trim(); // "Garching b. München" -> "Garching"
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=de&addressdetails=1&q=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "PGNX-Programmes/1.0 (community site; pgnx.github.io)" } });
    const d = await res.json();
    if (d[0]) cache[city] = { lat: +d[0].lat, lon: +d[0].lon, q, state: d[0].address?.state || d[0].address?.city || null };
    else console.log("no result:", city, "(" + q + ")");
  } catch (e) { console.log("error:", city, e.message); }
  fs.writeFileSync(OUT, JSON.stringify(cache, null, 1));
  await sleep(1100);
}
console.log(`geocoded ${Object.keys(cache).length} of ${cities.length} cities -> ${OUT}`);
