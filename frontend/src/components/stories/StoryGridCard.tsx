"use client";

import Link from "next/link";
import { ArrowUpRight, Bookmark, BookOpen, Clock3, Headphones, Loader2 } from "lucide-react";
import { getMediaUrl, type Story } from "@/services/storyService";
import { isBookmarked, toggleBookmark } from "@/lib/userLists";
import { useEffect, useState } from "react";
import { addServerBookmark, getServerBookmarks, removeServerBookmark } from "@/services/appService";
import { getToken } from "@/lib/auth";

export function StoryGridCard({ story }: { story: Story }) {
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(story.id));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!getToken()) return;
    getServerBookmarks().then((entries)=>setBookmarked(entries.some((entry)=>entry.story_id===story.id))).catch(()=>undefined);
  }, [story.id]);

  async function handleBookmark(event: React.MouseEvent) {
    event.preventDefault(); event.stopPropagation();
    if (saving) return;
    if (!getToken()) { setBookmarked(toggleBookmark(story)); return; }
    try {
      setSaving(true);
      const entries=await getServerBookmarks();
      const existing=entries.find((entry)=>entry.story_id===story.id);
      if(existing){await removeServerBookmark(existing.id);setBookmarked(false);}else{await addServerBookmark(story.id);setBookmarked(true);}
    } finally { setSaving(false); }
  }

  const coverUrl=getMediaUrl(story.cover_image);
  const partsCount=story.audio_parts?.length||0;

  return <Link href={`/stories/${story.id}`} className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-borderSoft bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_20px_45px_rgba(31,23,61,.12)]">
    <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-soft to-[#e7e0f0]">
      {coverUrl ? <img src={coverUrl} alt={story.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]" onError={(event)=>{event.currentTarget.style.display="none";}} /> : <div className="grid h-full place-items-center"><BookOpen size={38} className="text-primary/55"/></div>}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />
      <button type="button" onClick={handleBookmark} disabled={saving} aria-label={bookmarked?"Remove bookmark":"Add bookmark"} title={bookmarked?"Remove bookmark":"Add bookmark"} className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-xl border backdrop-blur-md transition ${bookmarked?"border-primary/20 bg-primary text-white":"border-white/40 bg-white/85 text-textMain hover:text-primary"}`}>
        {saving?<Loader2 size={16} className="animate-spin"/>:<Bookmark size={16} fill={bookmarked?"currentColor":"none"}/>} 
      </button>
      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-black/40 px-2.5 py-1.5 text-[11px] font-bold text-white backdrop-blur-md"><Headphones size={13}/>{partsCount>0?`${partsCount} parts`:"Audio pending"}</span>
    </div>
    <div className="flex flex-1 flex-col p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="line-clamp-2 text-base font-extrabold leading-6 tracking-[-.02em] text-textMain sm:text-lg">{story.title}</h3><p className="mt-1 line-clamp-1 text-xs font-semibold text-textMuted">{story.author||"Unknown author"}</p></div><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-page text-textMuted transition group-hover:bg-soft group-hover:text-primary"><ArrowUpRight size={15}/></span></div>
      <p className="mt-3 line-clamp-2 flex-1 text-sm leading-6 text-textMuted">{story.description||"No description available."}</p>
      <div className="mt-4 flex items-center justify-between border-t border-borderSoft pt-3 text-[11px] font-semibold text-textMuted"><span className="inline-flex items-center gap-1.5"><Clock3 size={13}/>{story.duration||0} min</span>{story.audio_status==="generating"?<span className="text-amber-600">Generating audio</span>:story.audio_status==="failed"?<span className="text-red-600">Audio unavailable</span>:<span className="text-emerald-600">Ready to listen</span>}</div>
    </div>
  </Link>;
}

