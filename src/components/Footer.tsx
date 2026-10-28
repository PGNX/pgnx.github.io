import Link from "next/link";
import { getData } from "@/lib/data";
import { formatDate } from "@/lib/data";
import { site } from "@/lib/site";

export function Footer() {
  const data = getData();
  return (
    <footer className="border-t border-line mt-16 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-3 text-sm text-ink-2">
        <div>
          <div className="font-semibold text-ink">{site.org}</div>
          <p className="mt-2 max-w-xs">A volunteer community helping Pakistani students study in Germany. Free, no agents, no fees.</p>
          <ul className="mt-3 space-y-1">
            {site.social.map((s) => (
              <li key={s.url}><a href={s.url} target="_blank" rel="noopener" className="hover:underline">{s.name}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="field-label">Data</div>
          <p className="mt-2">
            Programme information comes from the DAAD <em>International Programmes in Germany</em> database, plus programmes taken directly from university websites. Last refreshed {formatDate(data.builtAt.slice(0, 10))}.
          </p>
          <p className="mt-2">Deadlines and fees change every year. Always confirm on the official programme page before applying.</p>
        </div>
        <div>
          <div className="field-label">Links</div>
          <ul className="mt-2 space-y-1">
            <li><Link href="/programs" className="hover:underline">All programmes</Link></li>
            <li><Link href="/gpa" className="hover:underline">German grade calculator</Link></li>
            {site.reportUrl && <li><a href={site.reportUrl} target="_blank" rel="noopener" className="hover:underline">Give feedback / report an error</a></li>}
            <li><Link href="/about" className="hover:underline">About this site</Link></li>
            <li><a href="https://www2.daad.de/deutschland/studienangebote/international-programmes/en/" target="_blank" rel="noopener" className="hover:underline">DAAD database</a></li>
            <li><a href="https://www.hochschulkompass.de/en/" target="_blank" rel="noopener" className="hover:underline">Hochschulkompass</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
