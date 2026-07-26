"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { StoryGridCard } from "@/components/stories/StoryGridCard";
import { getHistory } from "@/lib/userLists";
import { getToken } from "@/lib/auth";
import { getServerHistory, resolveStories } from "@/services/appService";
import { getStories, type Story } from "@/services/storyService";
export function ContinueListening() {
  const [stories, setStories] = useState<Story[]>([]);
  useEffect(() => { if (!getToken()) { setStories(getHistory().slice(0, 3)); return; } Promise.all([getServerHistory(), getStories()]).then(([entries, allStories]) => setStories(resolveStories(entries, allStories).slice(0, 3))).catch(() => setStories([])); }, []);
  return <section><div className="mb-4 flex items-end justify-between gap-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#eee8ff] text-primary"><Clock3 size={19} /></span><div><h2 className="text-xl font-extrabold tracking-tight text-text">Continue listening</h2><p className="text-sm text-textMuted">Pick up exactly where you left off</p></div></div><Link className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline" href="/history">View history <ArrowRight size={16} /></Link></div>{stories.length === 0 ? <div className="rounded-2xl border border-[#ebe7ef] bg-white p-5 shadow-soft"><p className="font-semibold">No listening progress yet</p><p className="mt-1 text-sm text-textMuted">Start playing a story and it will appear here.</p></div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{stories.map((story) => <StoryGridCard key={story.id} story={story} />)}</div>}</section>;
}
