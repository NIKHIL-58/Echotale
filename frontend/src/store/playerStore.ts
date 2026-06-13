'use client';
import { create } from 'zustand';
import type { PlayerTrack } from '@/types/audio';

type PlayerStore = {
  track: PlayerTrack | null;
  isPlaying: boolean;
  expanded: boolean;
  setTrack: (track: PlayerTrack) => void;
  togglePlay: () => void;
  toggleExpanded: () => void;
};
export const usePlayerStore = create<PlayerStore>((set) => ({
  track: null,
  isPlaying: false,
  expanded: false,
  setTrack: (track) => set({ track, isPlaying: true }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  toggleExpanded: () => set((s) => ({ expanded: !s.expanded }))
}));
