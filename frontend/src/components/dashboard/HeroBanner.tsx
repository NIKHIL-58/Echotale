"use client";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-[#0b0920] px-6 py-10 text-white shadow-[0_24px_55px_rgba(26,16,72,.18)] sm:px-9 md:min-h-[390px] md:px-12 md:py-14">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(8,6,25,.98) 0%, rgba(10,7,31,.88) 43%, rgba(10,7,31,.15) 78%), url('/premium-story-world.png')",
          backgroundSize: "cover",
          backgroundPosition: "center right",
        }}
      />

      <div className="relative z-10 max-w-2xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.12em] backdrop-blur">
          <Star size={16} className="fill-[#e7bd69] text-[#e7bd69]" />
          Editor&apos;s Pick
        </div>

        <h1 className="max-w-xl text-4xl font-extrabold leading-[1.05] tracking-[-.045em] sm:text-5xl md:text-6xl">
          A world of stories, made to be heard.
        </h1>

        <p className="mt-5 max-w-lg text-base leading-7 text-white/70 sm:text-lg">
          Discover immersive audiobooks, save your favorites, and pick up exactly where you left off.
        </p>

        <Link
          href="/explore"
          className="mt-8 inline-flex items-center justify-center gap-3 rounded-[14px] bg-gradient-to-r from-[#f8df9a] to-[#dcae54] px-6 py-3.5 text-sm font-extrabold text-[#241807] shadow-[0_14px_32px_rgba(0,0,0,.2)] transition hover:-translate-y-0.5 hover:brightness-105"
        >
          Explore Now
          <ArrowRight size={24} />
        </Link>
      </div>
    </section>
  );
}


