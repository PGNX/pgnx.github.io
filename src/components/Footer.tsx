import Link from "next/link";
import Image from "next/image";
import { formatDate, getData, stats } from "@/lib/data";
import { asset, site } from "@/lib/site";
import { SocialIcon } from "./SocialIcon";

export function Footer() {
  const data = getData();
  const s = stats(data.programmes);
  return (
    <footer className="mt-16 bg-green text-white relative">
      <div className="h-1 w-full bg-gold" />
      <div className="band-pattern">
        <div className="mx-auto max-w-6xl px-4 pt-12 pb-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            {/* brand */}
            <div>
              <div className="flex items-center gap-3">
                <Image src={asset("/logo.png")} alt="" width={48} height={48} className="rounded-full bg-white shrink-0 ring-2 ring-white/20" />
                <div>
                  <div className="font-semibold text-lg leading-tight">{site.org}</div>
                  <div className="text-xs uppercase tracking-[0.14em] text-white/60">Free help for Pakistani students</div>
                </div>
              </div>
              <p className="mt-4 text-sm text-white/80 max-w-sm">
                Run by volunteers. No agents, no fees, no commissions. Just students who went to Germany helping the next ones get there.
              </p>
              <ul className="mt-5 flex gap-2">
                {site.social.map((so) => (
                  <li key={so.url}>
                    <a href={so.url} target="_blank" rel="noopener" title={so.name}
                      className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white hover:text-green transition-colors px-3 py-1.5 text-sm">
                      <SocialIcon name={so.name} size={18} />
                      <span className="hidden sm:inline">{so.name.replace(" channel", "").replace(" group", "")}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* explore */}
            <div>
              <div className="text-xs uppercase tracking-[0.14em] text-gold font-semibold">Explore</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/programs/" className="text-white/85 hover:text-white hover:underline">All programmes</Link></li>
                <li><Link href="/programs/?degree=Master" className="text-white/85 hover:text-white hover:underline">Master&rsquo;s programmes</Link></li>
                <li><Link href="/programs/?degree=Bachelor" className="text-white/85 hover:text-white hover:underline">Bachelor&rsquo;s programmes</Link></li>
                <li><Link href="/programs/?tuition=free&sort=deadline" className="text-white/85 hover:text-white hover:underline">No tuition fee, by deadline</Link></li>
                <li><Link href="/gpa/" className="text-white/85 hover:text-white hover:underline">German grade calculator</Link></li>
              </ul>
            </div>

            {/* about */}
            <div>
              <div className="text-xs uppercase tracking-[0.14em] text-gold font-semibold">PGNX</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/about/" className="text-white/85 hover:text-white hover:underline">About this site</Link></li>
                <li><Link href="/about/#community" className="text-white/85 hover:text-white hover:underline">Join the community</Link></li>
                {site.reportUrl && <li><a href={site.reportUrl} target="_blank" rel="noopener" className="text-white/85 hover:text-white hover:underline">Give feedback / report an error</a></li>}
                <li><a href="https://www2.daad.de/deutschland/studienangebote/international-programmes/en/" target="_blank" rel="noopener" className="text-white/85 hover:text-white hover:underline">DAAD database</a></li>
                <li><a href="https://www.hochschulkompass.de/en/" target="_blank" rel="noopener" className="text-white/85 hover:text-white hover:underline">Hochschulkompass</a></li>
              </ul>
            </div>

            {/* numbers */}
            <div>
              <div className="text-xs uppercase tracking-[0.14em] text-gold font-semibold">Right now</div>
              <dl className="mt-3 space-y-3">
                <Num v={s.programmes} l="programmes" />
                <Num v={s.universities} l="universities" />
                <Num v={s.free} l="without tuition fee" />
              </dl>
              <p className="mt-3 text-xs text-white/60">Data refreshed {formatDate(data.builtAt.slice(0, 10))}</p>
            </div>
          </div>

          <div className="mt-10 pt-5 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white/60">
            <p>Programme data from DAAD and university websites. Not affiliated with DAAD or any university. Always confirm on the official programme page.</p>
            <p className="shrink-0">Made with <span className="text-gold">♥</span> by PGNX volunteers · Free forever</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Num({ v, l }: { v: number; l: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="order-2 text-sm text-white/75">{l}</dt>
      <dd className="order-1 text-xl font-semibold tabular-nums text-white">{v.toLocaleString("en-GB")}</dd>
    </div>
  );
}
