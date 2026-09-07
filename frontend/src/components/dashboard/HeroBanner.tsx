"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Headphones, Play, Star } from "lucide-react";

export function HeroBanner() {
  return (
    <section className="relative isolate overflow-hidden rounded-[30px] border border-white/10 bg-[#0b0920] px-6 py-8 text-white shadow-[0_26px_70px_rgba(26,16,72,.20)] sm:px-9 md:min-h-[360px] md:px-11 md:py-10">
      <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(90deg, rgba(8,6,25,.99) 0%, rgba(10,7,31,.94) 42%, rgba(10,7,31,.18) 82%), url('/premium-story-world.png')", backgroundSize: "cover", backgroundPosition: "center right" }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_12%,rgba(174,132,255,.22),transparent_27%)]" />
      <div className="relative z-10 max-w-[650px]">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[.14em] backdrop-blur">
          <Star size={14} className="fill-[#e7bd69] text-[#e7bd69]" /> Editor&apos;s pick
        </div>
        <h1 className="max-w-xl text-4xl font-black leading-[1.01] tracking-[-.052em] sm:text-[52px]">Your next great story starts here.</h1>
        <p className="mt-4 max-w-lg text-sm leading-6 text-white/68 sm:text-base">Discover remarkable books, enjoy immersive narration, and continue every story from exactly where you paused.</p>
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <Link href="/explore" className="inline-flex h-12 items-center justify-center gap-2.5 rounded-[14px] bg-gradient-to-r from-[#f8df9a] to-[#e2b65d] px-5 text-sm font-extrabold text-[#241807] shadow-[0_12px_28px_rgba(0,0,0,.2)] transition hover:-translate-y-0.5 hover:brightness-105"><Play size={16} fill="currentColor" /> Explore stories <ArrowRight size={17} /></Link>
          <div className="hidden items-center gap-4 text-xs font-semibold text-white/60 sm:flex"><span className="inline-flex items-center gap-1.5"><BookOpen size={15} /> Curated library</span><span className="inline-flex items-center gap-1.5"><Headphones size={15} /> Listen anywhere</span></div>
        </div>
      </div>
      <div className="absolute bottom-5 right-5 hidden rounded-2xl border border-white/10 bg-[#17112f]/55 px-4 py-3 backdrop-blur-md xl:block"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#f0ca74]">Made for every moment</p><p className="mt-1 text-xs text-white/60">Read, listen, remember.</p></div>
    </section>
  );
}