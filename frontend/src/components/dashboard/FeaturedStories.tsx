"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StoryGridCard } from "@/components/stories/StoryGridCard";
import { EmptyState, ErrorState, StorySkeletons } from "@/components/ui/ContentState";
import { type Story } from "@/services/storyService";
import { getRecommendations } from "@/services/appService";
export function FeaturedStories() {
 const [stories, setStories] = useState<Story[]>([]), [loading,setLoading] = useState(true), [error,setError] = useState("");
 const load = useCallback(async () => { setLoading(true); setError(""); try { setStories((await getRecommendations()).slice(0,3)); } catch { setError("Recommendations are unavailable right now."); } finally {setLoading(false);} }, []);
 useEffect(() => {load();},[load]);
 return <section><div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="section-title">Recommended for you</h2><p className="mt-1 text-sm text-textMuted">A fresh chapter for your reading list.</p></div><Link href="/explore" className="inline-flex min-h-10 shrink-0 items-center gap-1.5 text-sm font-semibold text-primary">View all<ArrowRight size={15}/></Link></div>
 {loading ? <StorySkeletons/> : error ? <ErrorState message={error} onRetry={load}/> : stories.length ? <div className="story-grid">{stories.map(story => <StoryGridCard key={story.id} story={story}/>)}</div> : <EmptyState compact title="Discover your next favorite" description="Explore the collection and choose your favorite genres to shape your recommendations."/>}</section>;
}


