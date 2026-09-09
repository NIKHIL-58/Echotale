"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, ExternalLink, Loader2, Search, X } from "lucide-react";
import { getStories, getMediaUrl, type Story } from "@/services/storyService";
import { searchOpenLibrary, type LibraryBook } from "@/services/libraryService";
export function HeaderBookSearch() {
 const root=useRef<HTMLDivElement>(null);
 const [query,setQuery]=useState(""), [stories,setStories]=useState<Story[]>([]), [books,setBooks]=useState<LibraryBook[]>([]);
 const [open,setOpen]=useState(false), [loading,setLoading]=useState(false), [warning,setWarning]=useState("");
 useEffect(() => {
  getStories().then(setStories).catch(() => setStories([]));
  const outside=(e:PointerEvent) => {if(root.current&&!root.current.contains(e.target as Node))setOpen(false);};
  document.addEventListener("pointerdown",outside); return () => document.removeEventListener("pointerdown",outside);
 }, []);
 const local=useMemo(() => {const q=query.trim().toLowerCase();return q.length<2?[]:stories.filter(s=>[s.title,s.author,s.category].some(v=>v?.toLowerCase().includes(q))).slice(0,4);},[query,stories]);
 useEffect(() => {
  const clean=query.trim(); setBooks([]); setWarning("");
  if(clean.length<2){setLoading(false);return;}
  setOpen(true);setLoading(true);
  const controller=new AbortController();
  const timer=setTimeout(async () => {
   try {const result=await searchOpenLibrary(clean,controller.signal);if(!controller.signal.aborted){setBooks(result.books.slice(0,6));setWarning(result.warning||"");}}
   catch {if(!controller.signal.aborted)setWarning("Open Library is temporarily unavailable. You can still browse EchoTale results.");}
   finally {if(!controller.signal.aborted)setLoading(false);}
  },450);
  return () => {clearTimeout(timer);controller.abort();};
 }, [query]);
 return <div ref={root} className="relative min-w-0 w-full">
  <form role="search" onSubmit={e=>{e.preventDefault();setOpen(query.trim().length>=2);}} className="flex h-12 items-center gap-3 rounded-xl border border-borderSoft bg-white px-4 transition focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/5">
   <Search size={20} className="shrink-0 text-textMuted"/>
   <input aria-label="Search books, authors or topics" aria-controls={open?"header-book-results":undefined} value={query} onFocus={()=>query.trim().length>=2&&setOpen(true)} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Escape")setOpen(false);}} placeholder="Search books, authors, or topics…" className="min-w-0 w-full bg-transparent text-base outline-none placeholder:text-[#93899f] focus-visible:outline-none"/>
   {loading&&<Loader2 size={16} className="shrink-0 animate-spin text-primary"/>}
   {query&&<button type="button" aria-label="Clear search" onClick={()=>{setQuery("");setOpen(false);}} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-textMuted hover:bg-soft"><X size={16}/></button>}
  </form>
  {open&&<div id="header-book-results" role="region" aria-label="Book search results" className="absolute left-0 top-[calc(100%+8px)] z-[80] w-full min-w-0 overflow-hidden rounded-2xl border border-borderSoft bg-white shadow-[0_18px_55px_rgba(32,24,54,.18)]">
   <div className="flex items-center justify-between border-b border-borderSoft px-4 py-3"><div><h2 className="text-sm font-semibold">Discover books</h2><p className="text-xs text-textMuted">EchoTale + Open Library</p></div><button type="button" aria-label="Close search results" onClick={()=>setOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-soft"><X size={17}/></button></div>
   <div className="max-h-[min(65vh,540px)] space-y-5 overflow-y-auto p-4">
    {local.length>0&&<section><h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-textMuted">In EchoTale</h3><div className="space-y-2">{local.map(s=><Link href={`/stories/${s.id}`} key={s.id} onClick={()=>setOpen(false)} className="flex items-center gap-3 rounded-xl border border-borderSoft p-3 hover:bg-soft"><Cover src={getMediaUrl(s.cover_image)}/><span className="min-w-0"><span className="line-clamp-2 text-sm font-semibold">{s.title}</span><span className="block truncate text-xs text-textMuted">{s.author}</span></span></Link>)}</div></section>}
    <section><h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-textMuted">Open Library</h3>
     {warning&&<p role="status" className="mb-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{warning}</p>}
     {loading ? <p role="status" className="flex items-center justify-center gap-2 py-8 text-sm text-textMuted"><Loader2 size={17} className="animate-spin"/>Searching books…</p> : books.length ? <div className="grid gap-3 xl:grid-cols-2">{books.map(b=><article key={b.id} className="flex gap-3 rounded-xl border border-borderSoft p-3"><Cover src={b.coverUrl}/><div className="min-w-0"><h4 className="line-clamp-2 text-sm font-semibold">{b.title}</h4><p className="mt-1 line-clamp-1 text-xs text-textMuted">{b.author}{b.year ? ` · ${b.year}` : ""}</p><div className="mt-2 flex flex-wrap gap-2"><a href={b.detailsUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-soft px-2.5 text-xs font-semibold text-primary">Details<ExternalLink size={12}/></a>{b.freeToRead&&<a href={b.readUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center rounded-lg bg-primary px-2.5 text-xs font-semibold text-white">Read</a>}{b.pdfUrl&&<a href={b.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center rounded-lg border border-borderSoft px-2.5 text-xs font-semibold">PDF</a>}</div></div></article>)}</div> : !warning && <p className="py-5 text-sm text-textMuted">No books found. Try another title or author.</p>}
    </section>
   </div>
   <p className="border-t border-borderSoft bg-page px-4 py-3 text-xs leading-5 text-textMuted">Reading options depend on availability. External links open in a new tab.</p>
  </div>}
 </div>;
}
function Cover({src}:{src?:string}) { const [failed,setFailed]=useState(false);useEffect(()=>setFailed(false),[src]);return <span className="grid h-16 w-11 shrink-0 place-items-center overflow-hidden rounded-md bg-soft">{src&&!failed?<img src={src} alt="" loading="lazy" className="h-full w-full object-cover" onError={()=>setFailed(true)}/>:<BookOpen size={20} className="text-primary"/>}</span>; }
