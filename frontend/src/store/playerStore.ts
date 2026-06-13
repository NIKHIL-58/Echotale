"use client";

import { create } from "zustand";

export type PlayerTrack = {
  id: string;
  title: string;
  author: string;
  cover: string;
  duration: number;
  audioUrl?: string;
};

type PlayerState = {
  track: PlayerTrack | null;
  queue: PlayerTrack[];
  currentIndex: number;

  isPlaying: boolean;
  isExpanded: boolean;
  isRepeat: boolean;
  isShuffle: boolean;

  setTrack: (track: PlayerTrack) => void;
  setQueue: (queue: PlayerTrack[], startIndex?: number) => void;
  clearTrack: () => void;

  togglePlay: () => void;
  setPlaying: (value: boolean) => void;

  playNext: () => void;
  playPrevious: () => void;

  toggleExpanded: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  track: null,
  queue: [],
  currentIndex: -1,

  isPlaying: false,
  isExpanded: false,
  isRepeat: false,
  isShuffle: false,

  setTrack: (track) =>
    set({
      track,
      queue: [track],
      currentIndex: 0,
      isPlaying: true,
    }),

  setQueue: (queue, startIndex = 0) => {
    const safeIndex = Math.max(0, Math.min(startIndex, queue.length - 1));
    const track = queue[safeIndex] || null;

    set({
      queue,
      currentIndex: track ? safeIndex : -1,
      track,
      isPlaying: !!track,
    });
  },

  clearTrack: () =>
    set({
      track: null,
      queue: [],
      currentIndex: -1,
      isPlaying: false,
    }),

  togglePlay: () =>
    set((state) => ({
      isPlaying: !state.isPlaying,
    })),

  setPlaying: (value) =>
    set({
      isPlaying: value,
    }),

  playNext: () => {
    const { queue, currentIndex, isShuffle } = get();

    if (!queue.length) return;

    let nextIndex = currentIndex + 1;

    if (isShuffle && queue.length > 1) {
      nextIndex = Math.floor(Math.random() * queue.length);
      if (nextIndex === currentIndex) {
        nextIndex = (nextIndex + 1) % queue.length;
      }
    }

    if (nextIndex >= queue.length) {
      nextIndex = 0;
    }

    set({
      currentIndex: nextIndex,
      track: queue[nextIndex],
      isPlaying: true,
    });
  },

  playPrevious: () => {
    const { queue, currentIndex } = get();

    if (!queue.length) return;

    let previousIndex = currentIndex - 1;

    if (previousIndex < 0) {
      previousIndex = queue.length - 1;
    }

    set({
      currentIndex: previousIndex,
      track: queue[previousIndex],
      isPlaying: true,
    });
  },

  toggleExpanded: () =>
    set((state) => ({
      isExpanded: !state.isExpanded,
    })),

  toggleRepeat: () =>
    set((state) => ({
      isRepeat: !state.isRepeat,
    })),

  toggleShuffle: () =>
    set((state) => ({
      isShuffle: !state.isShuffle,
    })),
}));