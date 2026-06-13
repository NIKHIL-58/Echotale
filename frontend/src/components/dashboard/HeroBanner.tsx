"use client";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-[#120A3D] px-8 py-14 text-white shadow-card md:px-12">
      <div
        className="absolute inset-0 opacity-55"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(18,10,61,0.95), rgba(18,10,61,0.35)), url('https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1600&h=700&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative z-10 max-w-2xl">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
          <Star size={16} className="fill-white" />
          Editor&apos;s Pick
        </div>

        <h1 className="text-5xl font-extrabold leading-tight md:text-6xl">
          Stories That Resonate
        </h1>

        <p className="mt-6 text-2xl font-medium text-white/90">
          Listen. Feel. Remember.
        </p>

        <Link
          href="/explore"
          className="mt-10 inline-flex h-[64px] items-center justify-center gap-4 rounded-2xl bg-white px-8 text-xl font-extrabold text-primary shadow-[0_18px_40px_rgba(255,255,255,0.35)] transition hover:scale-[1.02]"
        >
          Explore Now
          <ArrowRight size={24} />
        </Link>
      </div>
    </section>
  );
}