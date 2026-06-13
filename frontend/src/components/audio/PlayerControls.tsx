'use client';
import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
export function PlayerControls(){ const {isPlaying,togglePlay}=usePlayerStore(); return <div className="flex items-center justify-center gap-6"><Shuffle/><SkipBack/><button onClick={togglePlay} className="grid h-16 w-16 place-items-center rounded-full bg-primary text-white">{isPlaying?<Pause/>:<Play/>}</button><SkipForward/><Repeat/></div> }
