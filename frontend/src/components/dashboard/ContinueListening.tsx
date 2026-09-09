"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StoryGridCard } from "@/components/stories/StoryGridCard";
import { EmptyState, ErrorState } from "@/components/ui/ContentState";
import { getHistory } from "@/lib/userLists";
import { getToken } from "@/lib/auth";
import { getServerHistory, resolveStories } from "@/services/appService";
import { getStories, type Story } from "@/services/storyService";
export function ContinueListening() {
 const [stories,setStories] = useState<Story[]>([]), [loading,setLoading] = useState(true), [error,setError] = useState("");
 const load = useCallback(async () => { setLoading(true); setError(""); try { if (!getToken()) setStories(getHistory().slice(0,3)); else { const [entries,all] = await Promise.all([getServerHistory(),getStories()]); setStories(resolveStories(entries,all).slice(0,3)); } } catch { setError("Your recent stories could not be loaded."); } finally {setLoading(false);} }, []);
 useEffect(() => {load();},[load]);
 return <section><div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="section-title">Back to your stories</h2><p className="mt-1 text-sm text-textMuted">Your recently opened reads and listens.</p></div><Link href="/history" className="inline-flex min-h-10 shrink-0 items-center gap-1.5 text-sm font-semibold text-primary">History<ArrowRight size={15}/></Link></div>
 {loading ? <div className="story-grid" role="status" aria-label="Loading recent stories">{[0,1,2].map(i => <div key={i} className="h-28 animate-pulse rounded-2xl bg-soft"/>)}</div> : error ? <ErrorState message={error} onRetry={load}/> : stories.length ? <div className="story-grid">{stories.map(story => <StoryGridCard key={story.id} story={story} compact/>)}</div> : <EmptyState compact title="Start a story, find it here" description="Recently opened stories stay within reach, ready for your next listening break."/>}</section>;
}
