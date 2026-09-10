"use client";
import { create } from "zustand";
export type PlayerTrack = { id: string; storyId: string; chapterId?: string; chapterNumber?: number; title: string; author: string; cover: string; duration: number; audioUrl?: string; textPreview?: string };
export type PlayerState = {
  track: PlayerTrack | null; queue: PlayerTrack[]; currentIndex: number;
  isPlaying: boolean; isExpanded: boolean; isRepeat: boolean; isShuffle: boolean;
  autoplay: boolean; playbackError: string; loadId: number; resumeOnLoad: boolean;
  currentTime: number; duration: number; playbackRate: number; volume: number;
  sleepTimerEnd: number | null; seekRequest: { value: number; id: number } | null;
  setTrack: (t: PlayerTrack) => void; setQueue: (q: PlayerTrack[], i?: number) => void;
  clearTrack: () => void; togglePlay: () => void; setPlaying: (v: boolean) => void;
  playNext: () => void; playPrevious: () => void; advanceAfterEnd: () => void;
  toggleExpanded: () => void; toggleRepeat: () => void; toggleShuffle: () => void;
  setAutoplay: (v: boolean) => void; setPlaybackError: (v: string) => void;
  setTiming: (t: number, d: number) => void; requestSeek: (v: number) => void;
  setPlaybackRate: (v: number) => void; setVolume: (v: number) => void;
  setSleepTimer: (minutes: number | null) => void;
};
export const usePlayerStore = create<PlayerState>((set, get) => {
  const select = (index: number, resumeOnLoad = false) => {
    const s = get(), track = s.queue[index];
    if (!track) { set({ isPlaying: false }); return; }
    set({ track, currentIndex: index, isPlaying: true, currentTime: 0, duration: track.duration || 0,
      loadId: s.loadId + 1, resumeOnLoad, playbackError: "", seekRequest: null });
  };
  return {
    track: null, queue: [], currentIndex: -1, isPlaying: false, isExpanded: false,
    isRepeat: false, isShuffle: false, autoplay: true, playbackError: "", loadId: 0,
    resumeOnLoad: true, currentTime: 0, duration: 0, playbackRate: 1, volume: 1,
    sleepTimerEnd: null, seekRequest: null,
    setTrack: track => get().setQueue([track]),
    setQueue: (queue, index = 0) => {
      const selected = queue[index]?.id;
      const playable = queue.filter(t => !!t.audioUrl);
      set({ queue: playable });
      if (!playable.length) { get().clearTrack(); return; }
      select(Math.max(0, playable.findIndex(t => t.id === selected)), true);
    },
    clearTrack: () => set(s => ({ track: null, queue: [], currentIndex: -1, isPlaying: false,
      currentTime: 0, duration: 0, loadId: s.loadId + 1, playbackError: "", sleepTimerEnd: null })),
    togglePlay: () => {
      const s = get(); if (!s.track) return;
      if (!s.isPlaying && s.duration > 0 && s.currentTime >= s.duration - .1) { select(s.currentIndex); return; }
      set({ isPlaying: !s.isPlaying, playbackError: "" });
    },
    setPlaying: isPlaying => set({ isPlaying, playbackError: "" }),
    playNext: () => {
      const s = get();
      let next = s.currentIndex + 1;
      if (s.isShuffle && s.queue.length > 1) {
        next = (s.currentIndex + 1 + Math.floor(Math.random() * (s.queue.length - 1))) % s.queue.length;
      }
      select(next);
    },
    playPrevious: () => select(Math.max(0, get().currentIndex - 1)),
    advanceAfterEnd: () => {
      const s = get();
      if (s.sleepTimerEnd && s.sleepTimerEnd <= Date.now()) { set({ isPlaying: false, sleepTimerEnd: null }); return; }
      if (s.isRepeat) select(s.currentIndex);
      else if (s.autoplay) s.playNext();
      else set({ isPlaying: false });
    },
    toggleExpanded: () => set(s => ({ isExpanded: !s.isExpanded })),
    toggleRepeat: () => set(s => ({ isRepeat: !s.isRepeat })),
    toggleShuffle: () => set(s => ({ isShuffle: !s.isShuffle })),
    setAutoplay: autoplay => {
      set({ autoplay });
      try { localStorage.setItem("echotale_autoplay", String(autoplay)); } catch {}
    },
    setPlaybackError: playbackError => set({ playbackError, isPlaying: false }),
    setTiming: (currentTime, duration) => set({ currentTime: Math.max(0, currentTime || 0), duration: Number.isFinite(duration) ? Math.max(0, duration) : 0 }),
    requestSeek: value => set(s => ({ seekRequest: { value: Math.max(0, value), id: (s.seekRequest?.id || 0) + 1 } })),
    setPlaybackRate: v => set({ playbackRate: Math.max(.5, Math.min(2, v)) }),
    setVolume: v => set({ volume: Math.max(0, Math.min(1, v)) }),
    setSleepTimer: minutes => set({ sleepTimerEnd: minutes ? Date.now() + minutes * 60000 : null }),
  };
});
