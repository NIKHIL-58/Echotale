"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock3, Headphones, Music, Pause, Play, Plus, Repeat, RotateCcw, RotateCw, SkipBack, SkipForward, Trash2, Volume2 } from "lucide-react";
import { EmptyState } from "@/components/ui/ContentState";
import { usePlayerStore } from "@/store/playerStore";
import { formatAudioTime as fmt } from "@/components/layout/BottomPlayer";
import { addTimestampNote, deleteTimestampNote, getTimestampNotes, type TimestampNote } from "@/services/playbackService";

export function ExpandedPlayer() {
  const p = usePlayerStore();
  const [notes, setNotes] = useState<TimestampNote[]>([]);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const storyId = p.track?.storyId;
  useEffect(() => {
    let active = true; setNotes([]); setMessage("");
    if (storyId) getTimestampNotes(storyId).then(items => { if (active) setNotes(items); }).catch(() => {});
    return () => { active = false; };
  }, [storyId]);
  async function saveNote() {
    if (!note.trim() || !p.track || saving) return;
    setSaving(true);
    try {
      const saved = await addTimestampNote({ story_id: p.track.storyId, chapter_id: p.track.chapterId, timestamp: p.currentTime, note: note.trim() });
      setNote(""); setNotes(items => [saved, ...items]); setMessage("Timestamp note saved.");
    } catch { setMessage("Unable to save this note. Please try again."); }
    finally { setSaving(false); }
  }
  async function remove(id: string) {
    try { await deleteTimestampNote(id); setNotes(items => items.filter(n => n.id !== id)); }
    catch { setMessage("Unable to delete this note. Please try again."); }
  }
  function jumpToNote(n: TimestampNote) {
    const index = p.queue.findIndex(item => (item.chapterId || "") === (n.chapter_id || ""));
    if (index < 0) { setMessage("That audio part is not in the current playlist."); return; }
    if (index !== p.currentIndex) p.setQueue(p.queue, index);
    p.requestSeek(n.timestamp);
  }
  if (!p.track) return <div className="space-y-6"><h1 className="page-title">Your listening room</h1><EmptyState title="Ready when you are" description="Open a story and choose a part. The next part will play automatically." /><Link className="action-primary" href="/library">Explore your library</Link></div>;
  const next = p.queue[p.currentIndex + 1];
  return <div className="space-y-6">
    <Link href={`/stories/${p.track.storyId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-textMuted hover:text-primary"><ArrowLeft size={17} />Back to story</Link>
    <section className="relative overflow-hidden rounded-3xl bg-[#17112f] p-5 text-white shadow-card sm:p-8">
      <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative grid items-center gap-7 md:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
        <div className="mx-auto flex aspect-[3/4] w-40 items-center justify-center overflow-hidden rounded-2xl bg-white/5 p-3 shadow-xl md:w-full">
          {p.track.cover ? <img src={p.track.cover} alt="" className="h-full w-full object-contain" /> : <Music size={60} className="text-white/40" />}
        </div>
        <div className="min-w-0">
          <p aria-live="polite" className="text-xs font-bold uppercase tracking-[.15em] text-[#e7c478]">{p.isPlaying ? "Now playing" : "Ready to continue"} · Part {p.currentIndex + 1} of {p.queue.length}</p>
          <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{p.track.title}</h1>
          <p className="mt-2 text-sm text-white/70">{p.track.author}</p>
          {p.playbackError && <p role="alert" className="mt-4 rounded-xl bg-white/10 p-3 text-sm text-amber-200">{p.playbackError}</p>}
          <div className="mt-6">
            <input aria-label="Playback position" type="range" min={0} max={p.duration || 0} step={.1} value={Math.min(p.currentTime, p.duration || 0)} onChange={e => p.requestSeek(Number(e.target.value))} className="w-full accent-[#e7bd69]" />
            <div className="mt-1 flex justify-between text-xs tabular-nums text-white/70"><span>{fmt(p.currentTime)}</span><span>{fmt(p.duration)} total</span></div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 sm:gap-4">
            <button aria-label="Previous part" onClick={p.playPrevious} className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10"><SkipBack size={22} /></button>
            <button aria-label="Back 10 seconds" onClick={() => p.requestSeek(p.currentTime - 10)} className="flex h-12 w-12 flex-col items-center justify-center rounded-full hover:bg-white/10"><RotateCcw size={20} /><span className="text-[10px]">10</span></button>
            <button aria-label={p.isPlaying ? "Pause audio" : "Play audio"} onClick={p.togglePlay} className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#e7bd69] text-[#241807] shadow-lg">{p.isPlaying ? <Pause size={27} /> : <Play size={27} />}</button>
            <button aria-label="Forward 10 seconds" onClick={() => p.requestSeek(p.currentTime + 10)} className="flex h-12 w-12 flex-col items-center justify-center rounded-full hover:bg-white/10"><RotateCw size={20} /><span className="text-[10px]">10</span></button>
            <button aria-label="Next part" disabled={!next && !p.isShuffle} onClick={p.playNext} className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10 disabled:opacity-30"><SkipForward size={22} /></button>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs">
            <label className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">Speed <select aria-label="Playback speed" value={p.playbackRate} onChange={e => p.setPlaybackRate(Number(e.target.value))} className="bg-transparent">{[.5,.75,1,1.25,1.5,1.75,2].map(v => <option className="text-black" key={v} value={v}>{v}×</option>)}</select></label>
            <label className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2"><Clock3 size={15} /><span className="sr-only">Sleep timer</span><select aria-label="Sleep timer" value={p.sleepTimerEnd ? "active" : "off"} onChange={e => p.setSleepTimer(e.target.value === "off" ? null : Number(e.target.value))} className="bg-transparent"><option className="text-black" value="off">Sleep timer off</option>{p.sleepTimerEnd && <option className="text-black" value="active">Ends {new Date(p.sleepTimerEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</option>}{[5,10,15,30,45,60].map(v => <option className="text-black" key={v} value={v}>{v} min</option>)}</select></label>
            <button aria-pressed={p.isRepeat} aria-label="Repeat current part" onClick={p.toggleRepeat} className={`flex items-center gap-2 rounded-xl px-3 py-2 ${p.isRepeat ? "bg-[#e7bd69] text-[#241807]" : "bg-white/10"}`}><Repeat size={15} />Repeat part</button>
            <label className="flex items-center gap-2"><Volume2 size={17} /><input aria-label="Volume" type="range" min={0} max={1} step={.05} value={p.volume} onChange={e => p.setVolume(Number(e.target.value))} className="w-20 accent-[#e7bd69]" /></label>
          </div>
        </div>
      </div>
    </section>
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="surface p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="section-title">Story playlist</h2><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={p.autoplay} onChange={e => p.setAutoplay(e.target.checked)} className="accent-primary" />Autoplay next</label></div>
        <p aria-live="polite" className="mt-2 text-sm text-textMuted">{p.isRepeat ? "This part will repeat." : !p.autoplay ? "Playback stops after this part." : next ? `Up next: Part ${next.chapterNumber || p.currentIndex + 2}` : "Final part · playback stops at the end."}</p>
        <ol className="mt-5 max-h-96 space-y-2 overflow-y-auto pr-1">{p.queue.map((item, index) => <li key={item.id}><button aria-current={index === p.currentIndex ? "true" : undefined} onClick={() => index === p.currentIndex ? p.togglePlay() : p.setQueue(p.queue, index)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left ${index === p.currentIndex ? "bg-soft text-primary" : "bg-page hover:bg-soft"}`}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-sm font-bold">{index === p.currentIndex && p.isPlaying ? <Headphones size={17} /> : index + 1}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{item.title}</span><span className="mt-1 line-clamp-1 block text-xs text-textMuted">{item.textPreview || item.author}</span></span><span className="shrink-0 text-xs text-textMuted">~{Math.round(item.duration / 60)} min</span></button></li>)}</ol>
      </section>
      <section className="surface p-5 sm:p-6">
        <h2 className="section-title">Notes for this moment</h2><p className="mt-2 text-sm text-textMuted">Part {p.currentIndex + 1} · {fmt(p.currentTime)}</p>
        <form onSubmit={e => { e.preventDefault(); void saveNote(); }} className="mt-5 flex gap-2"><input aria-label="Timestamp note" maxLength={1000} value={note} onChange={e => setNote(e.target.value)} placeholder="What would you like to remember?" className="h-11 min-w-0 flex-1 rounded-xl border border-borderSoft px-3 text-sm" /><button aria-label="Save timestamp note" disabled={saving || !note.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-white disabled:opacity-40"><Plus size={20} /></button></form>
        {message && <p role="status" className="mt-3 text-sm text-primary">{message}</p>}
        <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">{!notes.length ? <p className="rounded-xl bg-page p-5 text-sm text-textMuted">Your saved thoughts will appear here. Tap a timestamp to return to its part.</p> : notes.map(n => <div key={n.id} className="flex items-start gap-3 rounded-xl bg-page p-3"><button aria-label={`Jump to part ${n.chapter_id || 1} at ${fmt(n.timestamp)}`} onClick={() => jumpToNote(n)} className="shrink-0 rounded-lg bg-soft p-2 text-xs font-semibold text-primary">Part {n.chapter_id || 1}<br />{fmt(n.timestamp)}</button><p className="min-w-0 flex-1 break-words text-sm leading-6">{n.note}</p><button aria-label="Delete note" onClick={() => remove(n.id)} className="grid h-9 w-9 shrink-0 place-items-center text-red-600"><Trash2 size={16} /></button></div>)}</div>
      </section>
    </div>
  </div>;
}

