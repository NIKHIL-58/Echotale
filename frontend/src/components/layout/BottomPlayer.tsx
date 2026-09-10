"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ChevronUp, Music, Pause, Play, RotateCcw, SkipForward, X } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { attachAudioController } from "@/lib/audioController";
import { getProgress, queueProgress, syncPendingProgress } from "@/services/playbackService";

export const formatAudioTime = (s: number) => {
  const seconds = Math.max(0, Math.floor(s || 0));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

export function BottomPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const pathname = usePathname();
  const s = usePlayerStore();
  const hidden = pathname.startsWith("/auth") || pathname === "/onboarding";
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    try { usePlayerStore.getState().setAutoplay(localStorage.getItem("echotale_autoplay") !== "false"); } catch {}
    const controller = attachAudioController(audio, usePlayerStore, {
      restore: async track => {
        try {
          const value = JSON.parse(localStorage.getItem(`echotale-progress-${track.storyId}`) || "null");
          if (value) return value;
        } catch {}
        if (!localStorage.getItem("access_token") || !navigator.onLine) return null;
        return getProgress(track.storyId);
      },
      save: value => {
        try { localStorage.setItem(`echotale-progress-${value.story_id}`, JSON.stringify(value)); } catch {}
        if (!localStorage.getItem("access_token")) return;
        queueProgress(value);
        if (navigator.onLine) void syncPendingProgress().catch(() => {});
      },
    });
    const flush = () => controller.persist();
    const online = () => { if (localStorage.getItem("access_token")) void syncPendingProgress().catch(() => {}); };
    const visibility = () => { if (document.visibilityState === "hidden") flush(); };
    window.addEventListener("online", online);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", visibility);
    online();
    return () => {
      controller.dispose();
      window.removeEventListener("online", online);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    if (hidden || !localStorage.getItem("access_token")) usePlayerStore.getState().clearTrack();
  }, [pathname, hidden]);
  useEffect(() => {
    if (!s.sleepTimerEnd) return;
    const timer = setInterval(() => {
      if (Date.now() >= (usePlayerStore.getState().sleepTimerEnd || Infinity)) {
        usePlayerStore.getState().setPlaying(false);
        usePlayerStore.getState().setSleepTimer(null);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [s.sleepTimerEnd]);
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const track = s.track;
    navigator.mediaSession.metadata = track ? new MediaMetadata({
      title: track.title, artist: track.author, album: "EchoTale",
      artwork: track.cover ? [{ src: track.cover }] : [],
    }) : null;
    if (!track) return;
    const state = usePlayerStore.getState;
    const handlers: Partial<Record<MediaSessionAction, MediaSessionActionHandler>> = {
      play: () => { if (!state().isPlaying) state().togglePlay(); },
      pause: () => state().setPlaying(false),
      seekbackward: d => state().requestSeek(state().currentTime - (d.seekOffset || 10)),
      seekforward: d => state().requestSeek(state().currentTime + (d.seekOffset || 10)),
      seekto: d => { if (d.seekTime !== undefined) state().requestSeek(d.seekTime); },
      nexttrack: () => state().playNext(), previoustrack: () => state().playPrevious(),
    };
    Object.entries(handlers).forEach(([key, handler]) => {
      try { navigator.mediaSession.setActionHandler(key as MediaSessionAction, handler!); } catch {}
    });
    return () => { Object.keys(handlers).forEach(key => {
      try { navigator.mediaSession.setActionHandler(key as MediaSessionAction, null); } catch {}
    }); };
  }, [s.track?.id]);
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = !s.track ? "none" : s.isPlaying ? "playing" : "paused";
    try {
      if (s.duration > 0) navigator.mediaSession.setPositionState({
        duration: s.duration, playbackRate: s.playbackRate, position: Math.min(s.currentTime, s.duration),
      });
    } catch {}
  }, [s.track, s.currentTime, s.duration, s.isPlaying, s.playbackRate]);

  const track = s.track;
  return <>
    <audio ref={audioRef} preload="metadata" />
    {track && !hidden && <aside aria-label="Audiobook player" className="fixed bottom-[78px] left-3 right-3 z-40 overflow-hidden rounded-2xl border border-borderSoft bg-white/95 shadow-card backdrop-blur lg:bottom-0 lg:left-0 lg:right-0 lg:rounded-none">
      {s.playbackError && <p role="alert" className="border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700">{s.playbackError}</p>}
      <div className="flex items-center gap-2 px-3 py-3 sm:gap-4 lg:mx-auto lg:max-w-[1500px] lg:px-6">
        {track.cover ? <img src={track.cover} alt="" className="h-11 w-11 shrink-0 rounded-lg bg-soft object-contain" /> : <Music className="shrink-0 text-primary" />}
        <Link href="/player" className="min-w-0 flex-1 lg:max-w-[300px]" aria-label={`Open player: ${track.title}`}>
          <p className="truncate text-sm font-bold">{track.title}</p>
          <p className="mt-0.5 truncate text-xs text-textMuted">{s.currentIndex + 1} of {s.queue.length} parts · {s.isPlaying ? "Now playing" : "Paused"}</p>
        </Link>
        <button aria-label="Back 10 seconds" onClick={() => s.requestSeek(s.currentTime - 10)} className="icon-button hidden sm:grid"><RotateCcw size={18} /></button>
        <button aria-label={s.isPlaying ? "Pause audio" : "Play audio"} onClick={s.togglePlay} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-white">{s.isPlaying ? <Pause size={20} /> : <Play size={20} />}</button>
        <button aria-label="Next part" disabled={s.currentIndex >= s.queue.length - 1 && !s.isShuffle} onClick={s.playNext} className="icon-button disabled:opacity-30"><SkipForward size={19} /></button>
        <div className="hidden min-w-0 flex-1 items-center gap-3 lg:flex">
          <span className="text-xs tabular-nums text-textMuted">{formatAudioTime(s.currentTime)}</span>
          <input aria-label="Playback position" type="range" min={0} max={s.duration || 0} step={.1} value={Math.min(s.currentTime, s.duration || 0)} onChange={e => s.requestSeek(Number(e.target.value))} className="min-w-0 flex-1 accent-primary" />
          <span className="text-xs tabular-nums text-textMuted">{formatAudioTime(s.duration)}</span>
          <select aria-label="Playback speed" value={s.playbackRate} onChange={e => s.setPlaybackRate(Number(e.target.value))} className="rounded-lg border border-borderSoft p-2 text-xs">{[.5,.75,1,1.25,1.5,1.75,2].map(v => <option key={v} value={v}>{v}×</option>)}</select>
        </div>
        <Link href="/player" aria-label="Open full player" className="icon-button"><ChevronUp size={20} /></Link>
        <button aria-label="Close player" onClick={s.clearTrack} className="icon-button hidden lg:grid"><X size={18} /></button>
      </div>
      <div className="h-0.5 bg-soft lg:hidden"><div className="h-full bg-primary" style={{ width: `${s.duration ? Math.min(100, s.currentTime / s.duration * 100) : 0}%` }} /></div>
    </aside>}
  </>;
}

