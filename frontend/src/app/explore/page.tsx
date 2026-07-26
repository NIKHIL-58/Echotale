"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { getStories, type Story } from "@/services/storyService";
import { BookOpen, Compass, Loader2, Plus, SearchX } from "lucide-react";
import { StoryGridCard } from "@/components/stories/StoryGridCard";

function ExploreContent(){
 const params=useSearchParams(); const search=params.get("search")||""; const type=params.get("type")||"";
 const [stories,setStories]=useState<Story[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
 useEffect(()=>{getStories().then(setStories).catch(()=>setError("Unable to load stories right now.")).finally(()=>setLoading(false));},[]);
 const filtered=useMemo(()=>{let result=stories;if(type==="audiobooks")result=result.filter(s=>s.audio_status==="generated"||s.audio_status==="generating"||(s.audio_parts?.length||0)>0);const q=search.trim().toLowerCase();if(q)result=result.filter(s=>[s.title,s.author,s.category,s.description].some(value=>value?.toLowerCase().includes(q)));return result;},[stories,search,type]);
 return <AppLayout rightPanel={false}><div className="space-y-6">
  <header className="flex flex-col gap-5 rounded-[26px] border border-borderSoft bg-white p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-7"><div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-soft text-primary"><Compass size={22}/></span><div><p className="text-[11px] font-bold uppercase tracking-[.14em] text-primary">Discover</p><h1 className="mt-1 text-3xl font-black tracking-[-.04em] text-textMain">Explore stories</h1><p className="mt-1 text-sm text-textMuted">Find your next memorable listen.</p></div></div><div className="flex items-center gap-3"><span className="rounded-xl bg-page px-3 py-2 text-xs font-bold text-textMuted">{filtered.length} stories</span><Link href="/stories/upload" className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(118,87,211,.2)]"><Plus size={16}/>Upload</Link></div></header>
  {search&&<div className="flex items-center gap-2 rounded-xl border border-primary/10 bg-soft px-4 py-3 text-sm text-primary">Showing results for <b>“{search}”</b></div>}
  {loading&&<div className="grid min-h-64 place-items-center"><Loader2 className="animate-spin text-primary" size={30}/></div>}
  {!loading&&error&&<div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-700">{error}</div>}
  {!loading&&!error&&filtered.length===0&&<div className="grid min-h-72 place-items-center rounded-[26px] border border-dashed border-borderSoft bg-white p-8 text-center"><div><SearchX className="mx-auto text-textMuted" size={34}/><h2 className="mt-4 text-xl font-extrabold">No stories found</h2><p className="mt-2 text-sm text-textMuted">Try another search or upload a new story.</p></div></div>}
  {!loading&&!error&&filtered.length>0&&<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(story=><StoryGridCard key={story.id} story={story}/>)}</div>}
 </div></AppLayout>;
}
export default function ExplorePage(){return <Suspense fallback={null}><ExploreContent/></Suspense>}
