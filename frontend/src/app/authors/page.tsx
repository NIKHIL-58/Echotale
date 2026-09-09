"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState, ErrorState, StorySkeletons } from "@/components/ui/ContentState";
import { getAuthors, type Author } from "@/services/appService";
export default function AuthorsPage() {
 const [authors,setAuthors]=useState<Author[]>([]),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 const load=useCallback(async()=>{setLoading(true);setError("");try{setAuthors(await getAuthors());}catch{setError("Unable to load authors.");}finally{setLoading(false);}},[]);
 useEffect(()=>{load();},[load]);
 return <AppLayout><div className="space-y-6"><PageHeader title="Meet the storytellers" eyebrow="Behind every story" description="Discover the voices and imaginations behind your next favorite read."/>
 {loading?<StorySkeletons/>:error?<ErrorState message={error} onRetry={load}/>:!authors.length?<EmptyState title="New voices are on their way" description="Author profiles will appear here as the collection grows."/>:<div className="story-grid">{authors.map(author=><Link href={`/authors/${author.id}`} key={author.id} className="surface group p-6 transition hover:border-primary/30 hover:shadow-card"><div className="flex items-center gap-3"><div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-soft text-xl font-semibold text-primary">{author.avatar?<img src={author.avatar} alt="" className="h-full w-full object-cover"/>:author.name.slice(0,1).toUpperCase()}</div><div className="min-w-0 flex-1"><h2 className="truncate text-base font-semibold">{author.name}</h2><p className="text-xs text-textMuted">{author.followers_count} followers</p></div><ArrowUpRight size={17} className="text-textMuted group-hover:text-primary"/></div><p className="mt-4 line-clamp-3 text-sm leading-6 text-textMuted">{author.bio||"Explore this author's stories."}</p></Link>)}</div>}
 </div></AppLayout>;
}
