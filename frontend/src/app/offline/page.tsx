import Link from "next/link";
import { BookOpen, Download, Home, RefreshCw, WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#0b0920] px-5 py-10 text-white">
      <img src="/premium-story-world.png" alt="" className="absolute inset-0 h-full w-full object-cover object-right opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080619] via-[#0b0920]/95 to-[#0b0920]/55" />
      <section className="relative z-10 w-full max-w-lg rounded-[30px] border border-white/10 bg-white/[.08] p-7 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e6be6d] text-[#241807]"><BookOpen className="h-6 w-6" /></span><span className="text-xl font-black">EchoTale</span></div>
        <span className="mt-10 grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-[#f0cd85]"><WifiOff className="h-7 w-7" /></span>
        <h1 className="mt-6 text-4xl font-black tracking-[-.04em]">You’re offline,<br/>but your stories aren’t gone.</h1>
        <p className="mt-4 leading-7 text-white/65">Previously visited pages and cached stories remain available. Connect again for login, uploads, payments, and new content.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-r from-[#f2d58f] to-[#d9a94f] px-5 py-3 text-sm font-extrabold text-[#241807]"><Home className="h-4 w-4"/>Open dashboard</Link>
          <a href="/offline" className="inline-flex items-center gap-2 rounded-[14px] border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold"><RefreshCw className="h-4 w-4"/>Try again</a>
        </div>
        <div className="mt-8 flex items-center gap-2 border-t border-white/10 pt-5 text-xs text-white/45"><Download className="h-4 w-4"/>Tip: visit a page once online to make it available offline.</div>
      </section>
    </main>
  );
}

