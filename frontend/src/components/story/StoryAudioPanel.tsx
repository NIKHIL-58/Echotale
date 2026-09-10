"use client";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { ArrowUpRight, AudioLines, Check, Headphones, Loader2, Pause, Play } from "lucide-react";
import { usePlayerStore, type PlayerTrack } from "@/store/playerStore";
import { getMediaUrl, type Story } from "@/services/storyService";
import { NarrationSetup } from "./NarrationSetup";

export function StoryAudioPanel({ story, busy, onGenerate }: {
  story: Story; busy: boolean; onGenerate: (page: number | null) => Promise<void>;
}) {
  const player = usePlayerStore();
  const parts = useMemo(() => [...(story.audio_parts || [])].sort((a, b) => a.part_number - b.part_number), [story.audio_parts]);
  const queue = useMemo<PlayerTrack[]>(() => parts.filter(part => part.audio_url).map(part => ({
    id: `${story.id}-part-${part.part_number}`, storyId: story.id,
    chapterId: String(part.part_number), chapterNumber: part.part_number,
    title: `${story.title} · ${part.title || `Part ${part.part_number}`}`,
    author: story.author || "Unknown author", cover: getMediaUrl(story.cover_image),
    duration: (part.duration_estimate || 5) * 60, audioUrl: getMediaUrl(part.audio_url), textPreview: part.text_preview,
  })), [parts, story.id, story.title, story.author, story.cover_image]);
  const isThisStory = player.track?.storyId === story.id;
  const activeNumber = isThisStory ? player.track?.chapterNumber : undefined;
  const next = isThisStory ? queue.find(item => (item.chapterNumber || 0) > (activeNumber || 0)) : queue[0];
  useEffect(() => {
    const state = usePlayerStore.getState();
    if (state.track?.storyId !== story.id) return;
    const index = queue.findIndex(item => item.id === state.track?.id && item.audioUrl === state.track?.audioUrl);
    // Add newly generated parts without reloading the currently playing audio.
    if (index >= 0 && JSON.stringify(state.queue) !== JSON.stringify(queue)) usePlayerStore.setState({ queue, currentIndex: index });
  }, [queue, story.id]);
  function playPart(number: number) {
    if (isThisStory && activeNumber === number) { player.togglePlay(); return; }
    const index = queue.findIndex(item => item.chapterNumber === number);
    if (index >= 0) player.setQueue(queue, index);
  }
  function playStory() {
    if (isThisStory) player.togglePlay();
    else if (queue.length) player.setQueue(queue);
    else if (story.audio_url) player.setTrack({
      id: story.id, storyId: story.id, title: story.title, author: story.author,
      cover: getMediaUrl(story.cover_image), duration: story.duration * 60, audioUrl: getMediaUrl(story.audio_url),
    });
  }
  return <section className="surface overflow-hidden" aria-labelledby="audio-heading">
    <div className="border-b border-borderSoft bg-gradient-to-r from-soft/70 to-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-primary"><Headphones size={21} /></span><div><h2 id="audio-heading" className="section-title">Listen to the story</h2><p className="mt-1 text-sm text-textMuted">{queue.length ? `${queue.length} ready-to-play parts · One continuous playlist` : "Your story, at your pace"}</p></div></div>
        {(queue.length > 0 || story.audio_url) && <button onClick={playStory} className="action-primary">{isThisStory && player.isPlaying ? <Pause size={18} /> : <Play size={18} />}{isThisStory ? player.isPlaying ? "Pause story" : "Continue listening" : "Play story"}</button>}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={player.autoplay} onChange={e => player.setAutoplay(e.target.checked)} className="h-4 w-4 accent-primary" />Automatically play the next part</label>
        {isThisStory && <Link href="/player" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">Open listening room <ArrowUpRight size={16} /></Link>}
      </div>
      {story.narration_info?.start_page && <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-textMuted"><Check size={14} />Narration begins on PDF page {story.narration_info.start_page}</p>}
    </div>
    <div className="p-5 sm:p-6">
      {story.audio_status === "generating" && <p role="status" className="mb-4 flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-sm text-blue-800"><Loader2 size={17} className="shrink-0 animate-spin" />Generating narration. Completed parts are added automatically.</p>}
      {story.audio_error && <p role="alert" className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{story.audio_error}</p>}
      {parts.length > 0 ? <ol className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
        {parts.map(part => {
          const active = activeNumber === part.part_number;
          return <li key={part.part_number}><button disabled={!part.audio_url} onClick={() => playPart(part.part_number)} aria-current={active ? "true" : undefined} aria-label={`${active && player.isPlaying ? "Pause" : "Play"} ${part.title || `part ${part.part_number}`}`} className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition sm:gap-4 sm:p-4 disabled:opacity-50 ${active ? "border-primary/30 bg-soft" : "border-transparent bg-page/60 hover:border-borderSoft hover:bg-page"}`}>
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold ${active ? "bg-primary text-white" : "bg-white text-textMuted"}`}>{active && player.isPlaying ? <AudioLines size={18} /> : part.part_number}</span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-textMain">{part.title || `Part ${part.part_number}`}{active && <span className="ml-2 text-xs font-medium text-primary">{player.isPlaying ? "Playing" : "Selected"}</span>}</span><span className="mt-1 line-clamp-2 block text-xs leading-5 text-textMuted">{part.text_preview || "Ready to listen"}</span></span>
            <span className="shrink-0 text-xs tabular-nums text-textMuted">~{part.duration_estimate || 5} min</span>
            <span className="hidden text-primary sm:block">{active && player.isPlaying ? <Pause size={18} /> : <Play size={18} />}</span>
          </button></li>;
        })}
      </ol> : !story.audio_url && <div className="rounded-xl border border-dashed border-borderSoft p-6 text-center"><Headphones className="mx-auto text-primary" /><p className="mt-2 font-semibold">Narration is not ready yet</p><p className="mt-1 text-sm text-textMuted">{story.can_manage ? "Preview the story opening below to generate audio." : "The uploader can generate narration for this story."}</p></div>}
      {isThisStory && <p aria-live="polite" className="mt-4 rounded-xl bg-page px-4 py-3 text-sm text-textMuted">{player.isRepeat ? "Repeat part is on." : player.autoplay ? next ? `Up next: Part ${next.chapterNumber}. Playback continues automatically.` : "You’re on the final available part. Playback stops at the end." : "Autoplay is off. Playback stops after this part."}</p>}
      {story.can_manage && story.book_url && <NarrationSetup key={story.id} story={story} busy={busy || story.audio_status === "generating"} onGenerate={onGenerate} />}
    </div>
  </section>;
}

