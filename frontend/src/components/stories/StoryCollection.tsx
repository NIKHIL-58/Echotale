"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Trash2, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState, ErrorState, StorySkeletons } from "@/components/ui/ContentState";
import { StoryGridCard } from "./StoryGridCard";
import { getStories, getAudiobooks, getPodcasts, type Story } from "@/services/storyService";
import { getLibrary, getServerBookmarks, getServerHistory, clearServerHistory, resolveStories } from "@/services/appService";
import { getBookmarks, getHistory, clearHistory } from "@/lib/userLists";
import { getToken } from "@/lib/auth";
type Kind = "explore" | "stories" | "audiobooks" | "podcasts" | "library" | "bookmarks" | "history" | "category";
const copy: Record<Kind, [string, string, string]> = {
 explore: ["Find your next chapter", "Browse the collection. A new world is only a story away.", "Explore EchoTale"],
 stories: ["Stories", "Discover uploaded books, short stories and memorable worlds.", "The collection"],
 audiobooks: ["Audiobooks", "Give your eyes a break. Let a great story come to you.", "Made to be heard"],
 podcasts: ["Podcasts", "Fresh perspectives and spoken stories for everyday moments.", "Press play"],
 library: ["My library", "All the stories you have added, together in one place.", "Your personal shelf"],
 bookmarks: ["Bookmarks", "Keep the stories that catch your eye. Return when the moment is right.", "Saved for later"],
 history: ["Listening history", "Return to stories you recently opened and played.", "Your story so far"],
 category: ["Category", "Find your next story in this collection.", "Browse by genre"]
};
export function StoryCollection({ kind = "explore", category = "", initialQuery = "" }: { kind?: Kind; category?: string; initialQuery?: string }) {
 const [stories, setStories] = useState<Story[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState("");
 const [query, setQuery] = useState(initialQuery), [sort, setSort] = useState("default"), [clearing, setClearing] = useState(false), [actionError, setActionError] = useState("");
 useEffect(() => setQuery(initialQuery), [initialQuery]);
 const load = useCallback(async () => {
  setLoading(true); setError("");
  try {
   if (kind === "audiobooks") setStories(await getAudiobooks());
   else if (kind === "podcasts") setStories(await getPodcasts());
   else if (["library", "bookmarks", "history"].includes(kind)) {
    if (!getToken()) { setStories(kind === "history" ? getHistory() : kind === "bookmarks" ? getBookmarks() : []); return; }
    const [entries, all] = await Promise.all([kind === "library" ? getLibrary() : kind === "bookmarks" ? getServerBookmarks() : getServerHistory(), getStories()]);
    setStories(resolveStories(entries, all));
   } else setStories(await getStories());
  } catch { setError("We could not load this collection. Check your connection and try again."); }
  finally { setLoading(false); }
 }, [kind]);
 useEffect(() => { load(); }, [load]);
 const filtered = useMemo(() => {
  const q = query.trim().toLocaleLowerCase();
  let result = stories.filter(s => (!category || s.category?.toLowerCase() === category.toLowerCase()) && (!q || [s.title, s.author, s.category].some(v => v?.toLocaleLowerCase().includes(q))));
  if (sort === "title") result = [...result].sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "duration") result = [...result].sort((a, b) => (a.duration || Infinity) - (b.duration || Infinity));
  return result;
 }, [stories, category, query, sort]);
 async function clear() {
  if (!window.confirm("Clear all your listening history? This cannot be undone.")) return;
  setClearing(true); setActionError("");
  try { if (getToken()) await clearServerHistory(); else clearHistory(); setStories([]); }
  catch { setActionError("Your history was not cleared. Please try again."); }
  finally { setClearing(false); }
 }
 const [title, description, eyebrow] = copy[kind];
 const browse = ["explore", "stories", "category", "audiobooks", "podcasts"].includes(kind);
 return <AppLayout><div className="space-y-6">
  <PageHeader title={category ? category.charAt(0).toUpperCase() + category.slice(1) : title} description={description} eyebrow={eyebrow} back={category ? { href: "/explore", label: "All stories" } : undefined}
   actions={kind === "history" ? stories.length > 0 && <button type="button" onClick={clear} disabled={clearing} className="action-secondary !text-red-700"><Trash2 size={16}/>{clearing ? "Clearing…" : "Clear history"}</button> : kind !== "bookmarks" && <Link href="/stories/upload" className="action-primary"><Plus size={17}/>Upload story</Link>} />
  <div className="flex flex-col gap-3 rounded-2xl border border-borderSoft bg-white p-3 sm:flex-row sm:items-center">
   <div className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg bg-page px-3"><Search size={17} className="shrink-0 text-textMuted"/><input type="search" aria-label="Filter this collection" value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter by title or author" className="w-full min-w-0 bg-transparent text-sm outline-none focus-visible:outline-none" />{query && <button type="button" aria-label="Clear filter" onClick={() => setQuery("")} className="grid h-9 w-9 shrink-0 place-items-center"><X size={16}/></button>}</div>
   <div className="flex items-center justify-between gap-3"><span aria-live="polite" className="whitespace-nowrap px-2 text-xs text-textMuted">{loading ? "Loading…" : error ? "Unavailable" : `${filtered.length} ${filtered.length === 1 ? "story" : "stories"}`}</span><label className="flex items-center gap-2 text-xs text-textMuted">Sort<select value={sort} onChange={e => setSort(e.target.value)} className="min-h-11 rounded-lg border border-borderSoft bg-white px-2 text-sm text-textMain"><option value="default">{kind === "history" ? "Recent first" : "Default order"}</option><option value="title">Title A–Z</option><option value="duration">Shortest first</option></select></label></div>
  </div>
  {actionError && <ErrorState message={actionError}/>}
  {loading ? <StorySkeletons count={6}/> : error ? <ErrorState message={error} onRetry={load}/> : filtered.length === 0 ? <EmptyState title={query ? "No matching stories" : kind === "bookmarks" ? "A place for your next great find" : kind === "history" ? "Your story starts here" : "Make room for a good story"} description={query ? "Try a different title or author, or clear the filter above." : kind === "bookmarks" ? "Tap the bookmark on a story to save it to this shelf." : kind === "history" ? "Stories you open will appear here so you can easily find them again." : "Explore the library or upload a PDF to begin your collection."} href={browse ? "/stories/upload" : "/explore"} action={browse ? "Upload a story" : "Explore stories"}/> : <div className="story-grid">{filtered.map(story => <StoryGridCard key={story.id} story={story} onBookmarkChange={(id, saved) => { if (kind === "bookmarks" && !saved) setStories(items => items.filter(item => item.id !== id)); }}/>)}</div>}
 </div></AppLayout>;
}
