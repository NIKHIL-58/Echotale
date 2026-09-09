"use client";
import Link from "next/link";
import { ArrowUpRight, Bookmark, BookOpen, Clock3, Headphones, Loader2 } from "lucide-react";
import { getMediaUrl, type Story } from "@/services/storyService";
import { isBookmarked, toggleBookmark } from "@/lib/userLists";
import { useEffect, useState } from "react";
import { addServerBookmark, getServerBookmarks, removeServerBookmark } from "@/services/appService";
import { getToken } from "@/lib/auth";
export function StoryGridCard({ story, compact = false, onBookmarkChange }: { story: Story; compact?: boolean; onBookmarkChange?: (id: string, saved: boolean) => void }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [coverFailed, setCoverFailed] = useState(false);
  useEffect(() => {
    setBookmarked(isBookmarked(story.id));
    if (!getToken()) return;
    getServerBookmarks().then(entries => setBookmarked(entries.some(entry => entry.story_id === story.id))).catch(() => undefined);
  }, [story.id]);
  useEffect(() => setCoverFailed(false), [story.cover_image]);
  async function handleBookmark() {
    if (saving) return; setSaving(true); setError("");
    try {
      let saved: boolean;
      if (!getToken()) saved = toggleBookmark(story);
      else {
        const entries = await getServerBookmarks(); const existing = entries.find(entry => entry.story_id === story.id);
        if (existing) { await removeServerBookmark(existing.id); saved = false; }
        else { await addServerBookmark(story.id); saved = true; }
      }
      setBookmarked(saved); onBookmarkChange?.(story.id, saved);
    } catch { setError("Could not update bookmark. Please try again."); }
    finally { setSaving(false); }
  }
  const cover = getMediaUrl(story.cover_image);
  const parts = story.audio_parts?.length || 0;
  const ready = parts > 0 || Boolean(story.audio_url);
  if (compact) return <Link href={`/stories/${story.id}`} className="surface group flex items-center gap-4 p-3 transition hover:border-primary/30 hover:shadow-card">
    <span className="grid h-20 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-soft">{cover && !coverFailed ? <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover" onError={() => setCoverFailed(true)} /> : <BookOpen className="text-primary" size={22}/>}</span>
    <span className="min-w-0 flex-1"><span className="line-clamp-2 text-sm font-semibold leading-5 group-hover:text-primary">{story.title}</span><span className="mt-1 block truncate text-xs text-textMuted">{story.author || "Unknown author"}</span><span className="mt-2 flex items-center gap-1 text-xs text-textMuted"><Headphones size={12}/>{parts ? `${parts} parts` : "View story"}</span></span><ArrowUpRight size={17} className="shrink-0 text-textMuted" />
  </Link>;
  return <article className="surface group flex h-full flex-col overflow-hidden transition duration-200 hover:border-primary/30 hover:shadow-card">
    <div className="relative bg-[#eeeaf3]">
      <Link href={`/stories/${story.id}`} aria-label={`View ${story.title}`} className="block h-52 overflow-hidden">
        {cover && !coverFailed ? <img src={cover} alt={story.title} loading="lazy" className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-[1.025]" onError={() => setCoverFailed(true)} /> : <div className="flex h-full items-end bg-[url('/images/reading-corner.png')] bg-cover bg-center p-4"><span className="rounded-lg bg-white/90 p-2 text-primary"><BookOpen size={22}/></span></div>}
      </Link>
      <button type="button" onClick={handleBookmark} disabled={saving} aria-label={`${bookmarked ? "Remove" : "Add"} bookmark: ${story.title}`} aria-pressed={bookmarked} className={`absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-xl border shadow-sm transition ${bookmarked ? "border-primary bg-primary text-white" : "border-white bg-white/95 text-textMuted hover:text-primary"}`}>
        {saving ? <Loader2 size={17} className="animate-spin"/> : <Bookmark size={17} fill={bookmarked ? "currentColor" : "none"}/>}
      </button>
    </div>
    <div className="flex flex-1 flex-col p-5">
      <div className="mb-2 flex items-center justify-between gap-2 text-xs text-textMuted"><span>{story.category || "Story"}</span>{story.is_premium && <span className="rounded-md bg-amber-50 px-2 py-0.5 text-amber-800">Premium</span>}</div>
      <h3 className="line-clamp-2 text-base font-bold leading-6 tracking-[-.015em]"><Link href={`/stories/${story.id}`} className="hover:text-primary">{story.title}</Link></h3>
      <p className="mt-1 truncate text-sm text-textMuted">{story.author || "Unknown author"}</p>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-textMuted">{story.description || "Open this story to discover more."}</p>
      <div className="mt-auto pt-4"><div className="flex flex-wrap items-center justify-between gap-2 border-t border-borderSoft pt-3 text-xs text-textMuted"><span className="inline-flex items-center gap-1.5">{ready ? <Headphones size={14}/> : <BookOpen size={14}/>}{parts ? `${parts} parts` : story.audio_status === "generating" ? "Preparing audio" : ready ? "Audio available" : "Read story"}</span>{story.duration > 0 && <span className="inline-flex items-center gap-1.5"><Clock3 size={14}/>{story.duration} min</span>}</div></div>
      {error && <p role="alert" className="mt-3 text-xs text-red-700">{error}</p>}
    </div>
  </article>;
}

