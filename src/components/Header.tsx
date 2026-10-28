import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";

export function Header() {
  return (
    <header className="bg-green text-white">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <Image src="/logo.png" alt="" width={36} height={36} priority className="shrink-0 rounded-full bg-white" />
          <span className="flex flex-col leading-tight min-w-0">
            <span className="text-[15px] font-semibold tracking-tight truncate text-white">{site.name}</span>
            <span className="text-[11px] uppercase tracking-[0.12em] text-white/70">{site.org}</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/" className="btn btn-header" aria-label="Home">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m3 11 9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>
            <span className="hidden sm:inline">Home</span>
          </Link>
          <span className="hidden sm:flex items-center gap-1">
            <Link href="/programs" className="btn btn-header">All programmes</Link>
            <Link href="/gpa" className="btn btn-header">Grade calculator</Link>
            <Link href="/about" className="btn btn-header">About</Link>
          </span>
          {site.communityUrl ? (
            <a href={site.communityUrl} target="_blank" rel="noopener" className="btn btn-header-solid"><span className="sm:hidden">Join</span><span className="hidden sm:inline">Join community</span></a>
          ) : (
            <Link href="/about#community" className="btn btn-header-solid"><span className="sm:hidden">Join</span><span className="hidden sm:inline">Join community</span></Link>
          )}
        </nav>
      </div>
    </header>
  );
}
