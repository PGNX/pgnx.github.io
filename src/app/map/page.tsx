import type { Metadata } from "next";
import { MapClient } from "@/components/MapClient";
import { getProgrammes, stats } from "@/lib/data";

export const metadata: Metadata = { title: "Map of universities", description: "Where the English-taught programmes are: every German city on a map, with programme counts and links." };

export default function MapPage() {
  const s = stats(getProgrammes());
  return (
    <div>
      <section className="band band-pattern">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="eyebrow text-white/60">Explore by place</div>
          <h1 className="mt-2 text-3xl md:text-4xl text-white">Where the programmes are</h1>
          <p className="mt-2 text-white/80 max-w-2xl">
            {s.programmes.toLocaleString("en-GB")} English-taught programmes at {s.universities} institutions across {s.cities} cities. Each colour is a federal state, bigger circles mean more programmes. Hover a state for its total, click a city for its universities and programme list.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <MapClient />
        <p className="mt-4 text-xs text-muted">City positions from OpenStreetMap, state boundaries from the Federal Agency for Cartography and Geodesy (BKG, dl-de/by-2-0). Programmes on several campuses are shown at the main city listed by DAAD.</p>
      </div>
    </div>
  );
}
