"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { StoryGridCard } from "@/components/stories/StoryGridCard";
import { type Story } from "@/services/storyService";
import { getRecommendations } from "@/services/appService";
export function FeaturedStories() {
  const [stories, setStories] = useState<Story[]>([]);
  useEffect(() => { getRecommendations().then((items) => setStories(items.slice(0, 3))).catch(() => setStories([])); }, []);
  return <section><div className="mb-4 flex items-end justify-between gap-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#fff4d7] text-[#ad7619]"><Sparkles size={19} /></span><div><h2 className="text-xl font-extrabold tracking-tight text-text">Featured stories</h2><p className="text-sm text-textMuted">Handpicked listens worth discovering</p></div></div><Link className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline" href="/explore">View all <ArrowRight size={16} /></Link></div>{stories.length === 0 ? <div className="rounded-2xl border border-[#ebe7ef] bg-white p-5 shadow-soft"><p className="font-semibold">No featured stories yet</p><p className="mt-1 text-sm text-textMuted">Upload a story to see it here.</p></div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{stories.map((story) => <StoryGridCard key={story.id} story={story} />)}</div>}</section>;
}


