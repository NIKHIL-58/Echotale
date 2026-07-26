"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Headphones, Star } from "lucide-react";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-[26px] bg-[#0b0920] px-6 py-8 text-white shadow-[0_22px_50px_rgba(26,16,72,.16)] sm:px-9 md:min-h-[330px] md:px-11 md:py-10">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(8,6,25,.99) 0%, rgba(10,7,31,.91) 44%, rgba(10,7,31,.2) 76%), url('/premium-story-world.png')",
          backgroundSize: "cover",
          backgroundPosition: "center right",
        }}
      />
      <div className="relative z-10 max-w-[620px]">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[.14em] backdrop-blur">
          <Star size={14} className="fill-[#e7bd69] text-[#e7bd69]" />
          Editor&apos;s Pick
        </div>
        <h1 className="max-w-xl text-4xl font-extrabold leading-[1.02] tracking-[-.045em] sm:text-[50px]">
          A world of stories, made to be heard.
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-6 text-white/70 sm:text-base">
          Discover immersive audiobooks, save your favorites, and pick up exactly where you left off.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link href="/explore" className="inline-flex h-11 items-center justify-center gap-2.5 rounded-[13px] bg-gradient-to-r from-[#f8df9a] to-[#dcae54] px-5 text-sm font-extrabold text-[#241807] shadow-[0_12px_28px_rgba(0,0,0,.2)] transition hover:-translate-y-0.5 hover:brightness-105">
            Explore stories <ArrowRight size={18} />
          </Link>
          <div className="hidden items-center gap-4 text-xs font-semibold text-white/65 sm:flex">
            <span className="inline-flex items-center gap-1.5"><BookOpen size={15} /> Curated library</span>
            <span className="inline-flex items-center gap-1.5"><Headphones size={15} /> Listen anywhere</span>
          </div>
        </div>
      </div>
    </section>
  );
}
