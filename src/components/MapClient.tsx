"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
const LEAFLET_JS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
const LEAFLET_CSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";

/** One colour per federal state (Bundesland). Chosen to stay distinct next to each other on the map. */
export const STATE_COLORS: Record<string, string> = {
  "Baden-Württemberg": "#0d6b3a", Bayern: "#1d4ed8", Berlin: "#b91c1c", Brandenburg: "#c2410c",
  Bremen: "#0e7490", Hamburg: "#7c3aed", Hessen: "#ca8a04", "Mecklenburg-Vorpommern": "#0f766e",
  Niedersachsen: "#be185d", "Nordrhein-Westfalen": "#4338ca", "Rheinland-Pfalz": "#15803d", Saarland: "#a16207",
  "Sachsen-Anhalt": "#9333ea", Sachsen: "#dc2626", "Schleswig-Holstein": "#0369a1", Thüringen: "#ea580c",
};
const STATE_EN: Record<string, string> = {
  Bayern: "Bavaria", Hessen: "Hesse", Niedersachsen: "Lower Saxony", "Nordrhein-Westfalen": "North Rhine-Westphalia",
  "Rheinland-Pfalz": "Rhineland-Palatinate", Sachsen: "Saxony", "Sachsen-Anhalt": "Saxony-Anhalt", Thüringen: "Thuringia",
  "Mecklenburg-Vorpommern": "Mecklenburg-Western Pomerania",
};
const FALLBACK = "#475569";

interface City { city: string; count: number; free: number; masters: number; bachelors: number; lat: number; lon: number; state: string | null; universities: { name: string; n: number }[] }
type LatLng = [number, number];
type Layer = { addTo: (m: unknown) => Layer; bindPopup: (html: string, o?: object) => Layer; bindTooltip: (html: string, o?: object) => Layer; on: (ev: string, fn: (e: { target: { setStyle: (s: object) => void; getBounds?: () => unknown } }) => void) => Layer; openPopup: () => void; setStyle: (s: object) => void; getBounds: () => unknown; bringToFront: () => void };
type LeafletMap = { setView: (c: LatLng, z: number) => LeafletMap; flyTo: (c: LatLng, z: number) => LeafletMap; fitBounds: (b: unknown, o?: object) => LeafletMap; remove: () => void; createPane: (n: string) => { style: CSSStyleDeclaration } };
type LeafletNS = {
  map: (el: HTMLElement, o?: object) => LeafletMap;
  tileLayer: (url: string, o: object) => Layer;
  circleMarker: (c: LatLng, o: object) => Layer;
  geoJSON: (data: unknown, o: object) => Layer & { eachLayer: (fn: (l: Layer & { feature: { properties: { name: string } } }) => void) => void };
};

function loadLeaflet(): Promise<LeafletNS> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as { L?: LeafletNS };
    if (w.L) return resolve(w.L);
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) { const css = document.createElement("link"); css.rel = "stylesheet"; css.href = LEAFLET_CSS; document.head.appendChild(css); }
    const s = document.createElement("script"); s.src = LEAFLET_JS; s.async = true;
    s.onload = () => (w.L ? resolve(w.L) : reject(new Error("Leaflet missing")));
    s.onerror = () => reject(new Error("Leaflet failed to load"));
    document.head.appendChild(s);
  });
}

export function MapClient() {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const cityMarkers = useRef<Map<string, Layer>>(new Map());
  const stateLayers = useRef<Map<string, Layer>>(new Map());
  const [cities, setCities] = useState<City[] | null>(null);
  const [states, setStates] = useState<{ name: string; count: number; cities: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    Promise.all([
      loadLeaflet(),
      fetch(`${BASE}/data/cities.json`).then((r) => r.json()),
      fetch(`${BASE}/data/bundeslaender.geojson`).then((r) => r.json()),
    ]).then(([L, data, geo]: [LeafletNS, { cities: City[] }, unknown]) => {
      if (!alive || !el.current) return;
      const map = L.map(el.current, { scrollWheelZoom: false }).setView([51.2, 10.4], 6);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · Boundaries &copy; GeoBasis-DE / BKG (dl-de/by-2-0)', maxZoom: 18, opacity: 0.55,
      }).addTo(map);

      // totals per state
      const totals: Record<string, { count: number; cities: number }> = {};
      for (const c of data.cities) { const k = c.state ?? "Unknown"; totals[k] ??= { count: 0, cities: 0 }; totals[k].count += c.count; totals[k].cities++; }

      // state polygons: light fill in the state colour, stronger on hover, click zooms
      const gj = L.geoJSON(geo, {
        style: (f: { properties: { name: string } }) => ({ color: STATE_COLORS[f.properties.name] ?? FALLBACK, weight: 1.2, fillColor: STATE_COLORS[f.properties.name] ?? FALLBACK, fillOpacity: 0.12 }),
        onEachFeature: (f: { properties: { name: string } }, layer: Layer) => {
          const name = f.properties.name; const t = totals[name] ?? { count: 0, cities: 0 };
          layer.bindTooltip(`<strong>${name}</strong>${STATE_EN[name] ? ` (${STATE_EN[name]})` : ""}<br>${t.count} programmes in ${t.cities} cit${t.cities === 1 ? "y" : "ies"}`, { sticky: true });
          layer.on("mouseover", (e) => { e.target.setStyle({ fillOpacity: 0.28, weight: 2 }); });
          layer.on("mouseout", (e) => { e.target.setStyle({ fillOpacity: 0.12, weight: 1.2 }); });
          layer.on("click", (e) => { if (e.target.getBounds) map.fitBounds(e.target.getBounds(), { padding: [20, 20] }); });
          stateLayers.current.set(name, layer);
        },
      }).addTo(map);
      void gj;

      const max = Math.max(...data.cities.map((c) => c.count));
      for (const c of data.cities) {
        const color = STATE_COLORS[c.state ?? ""] ?? FALLBACK;
        const r = 5 + 20 * Math.sqrt(c.count / max);
        const unis = c.universities.slice(0, 4).map((u) => `<li>${u.name} <span style="color:#6b7280">(${u.n})</span></li>`).join("");
        const more = c.universities.length > 4 ? `<li style="color:#6b7280">+${c.universities.length - 4} more</li>` : "";
        const html = `<div style="min-width:230px"><div style="font-weight:700;font-size:15px">${c.city}</div>
          <div style="color:#334155;font-size:13px;margin-top:2px">${c.state ?? ""}${c.state ? " · " : ""}${c.count} programme${c.count === 1 ? "" : "s"} · ${c.free} without tuition fee</div>
          <ul style="margin:8px 0 0;padding-left:16px;font-size:12.5px;line-height:1.5">${unis}${more}</ul>
          <a href="${BASE}/programs/?city=${encodeURIComponent(c.city)}" style="display:inline-block;margin-top:10px;background:${color};color:#fff;padding:6px 10px;border-radius:4px;font-size:13px;text-decoration:none">See programmes in ${c.city} →</a></div>`;
        const m = L.circleMarker([c.lat, c.lon], { radius: r, color: "#ffffff", weight: 1.5, fillColor: color, fillOpacity: 0.85 });
        m.addTo(map).bindPopup(html, { maxWidth: 320 });
        m.on("mouseover", (e) => { e.target.setStyle({ fillOpacity: 1, weight: 2.5 }); });
        m.on("mouseout", (e) => { e.target.setStyle({ fillOpacity: 0.85, weight: 1.5 }); });
        cityMarkers.current.set(c.city, m);
      }
      mapRef.current = map;
      setCities(data.cities);
      setStates(Object.entries(totals).filter(([k]) => k !== "Unknown").map(([name, t]) => ({ name, ...t })).sort((a, b) => b.count - a.count));
    }).catch((e: Error) => alive && setError(e.message));
    return () => { alive = false; mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  const list = (cities ?? []).filter((c) => !q || c.city.toLowerCase().includes(q.toLowerCase())).slice(0, 60);
  function goCity(c: City) { mapRef.current?.flyTo([c.lat, c.lon], 10); cityMarkers.current.get(c.city)?.openPopup(); }
  function goState(name: string) { const l = stateLayers.current.get(name); if (l && mapRef.current) mapRef.current.fitBounds(l.getBounds(), { padding: [20, 20] }); }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="card overflow-hidden">
        <div ref={el} className="h-[66vh] min-h-[440px] w-full bg-paper-2" aria-label="Map of German cities with English-taught programmes" />
        {error && <div className="p-4 text-sm text-red">Map could not load ({error}). The lists on the right still work.</div>}
      </div>
      <aside className="card p-4 flex flex-col gap-4 min-h-0">
        <div>
          <div className="field-label">By federal state</div>
          <ul className="mt-2 grid grid-cols-1 gap-1 max-h-[34vh] overflow-auto pr-1">
            {states.map((s) => (
              <li key={s.name}>
                <button type="button" onClick={() => goState(s.name)} className="w-full flex items-center gap-2 text-left py-1 px-1 rounded-[4px] hover:bg-paper-2">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: STATE_COLORS[s.name] ?? FALLBACK }} />
                  <span className="text-sm truncate flex-1">{s.name}{STATE_EN[s.name] ? <span className="text-muted"> · {STATE_EN[s.name]}</span> : null}</span>
                  <span className="text-xs text-muted tabular-nums shrink-0">{s.count}</span>
                </button>
              </li>
            ))}
            {!states.length && <li className="text-xs text-muted">Loading…</li>}
          </ul>
        </div>
        <div className="border-t border-line pt-3">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a city" className="control" aria-label="Find a city" />
          <ul className="mt-2 divide-y divide-line overflow-auto max-h-[26vh]">
            {list.map((c) => (
              <li key={c.city}>
                <button type="button" onClick={() => goCity(c)} className="w-full text-left py-1.5 px-1 flex items-center gap-2 hover:bg-paper-2 rounded-[4px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STATE_COLORS[c.state ?? ""] ?? FALLBACK }} />
                  <span className="text-sm truncate flex-1">{c.city}</span>
                  <span className="text-xs text-muted tabular-nums shrink-0">{c.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <Link href="/programs/" className="btn btn-secondary justify-center">All programmes</Link>
      </aside>
    </div>
  );
}
