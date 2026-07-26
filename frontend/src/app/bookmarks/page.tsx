"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { Bookmark, Compass, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getStories,type Story } from "@/services/storyService";
import { getBookmarks } from "@/lib/userLists";
import { StoryGridCard } from "@/components/stories/StoryGridCard";
import { getServerBookmarks,resolveStories } from "@/services/appService";
import { getToken } from "@/lib/auth";
export default function BookmarksPage(){const[stories,setStories]=useState<Story[]>([]);const[loading,setLoading]=useState(true);useEffect(()=>{async function load(){if(!getToken()){setStories(getBookmarks());return;}const[e,a]=await Promise.all([getServerBookmarks(),getStories()]);setStories(resolveStories(e,a));}load().catch(()=>setStories([])).finally(()=>setLoading(false));},[]);return <AppLayout rightPanel={false}><div className="space-y-6">
<header className="flex flex-col gap-5 rounded-[26px] border border-borderSoft bg-white p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-7"><div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0dd] text-[#db742b]"><Bookmark size={22}/></span><div><p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#b75c20]">Saved for later</p><h1 className="mt-1 text-3xl font-black tracking-[-.04em]">Bookmarks</h1><p className="mt-1 text-sm text-textMuted">A quiet shelf for stories you want to return to.</p></div></div><span className="w-fit rounded-xl bg-page px-3 py-2 text-xs font-bold text-textMuted">{stories.length} bookmarked</span></header>
{loading?<div className="grid min-h-64 place-items-center"><Loader2 className="animate-spin text-primary" size={30}/></div>:stories.length===0?<div className="grid min-h-72 place-items-center rounded-[26px] border border-dashed border-borderSoft bg-white p-8 text-center"><div><Bookmark className="mx-auto text-primary" size={34}/><h2 className="mt-4 text-xl font-extrabold">Nothing bookmarked yet</h2><p className="mt-2 text-sm text-textMuted">Use the bookmark icon on any story to keep it here.</p><Link href="/explore" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white"><Compass size={16}/>Explore stories</Link></div></div>:<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{stories.map(s=><StoryGridCard key={s.id} story={s}/>)}</div>}
</div></AppLayout>}
