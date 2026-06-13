"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ListMusic,
  Music,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function BottomPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    track,
    queue,
    currentIndex,
    isPlaying,
    isExpanded,
    isRepeat,
    isShuffle,
    togglePlay,
    setPlaying,
    toggleExpanded,
    playNext,
    playPrevious,
    toggleRepeat,
    toggleShuffle,
  } = usePlayerStore();

  const [currentTime, setCurrentTime] = useState(0);
  const [realDuration, setRealDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !track?.audioUrl) return;

    audio.src = track.audioUrl;
    audio.load();

    setCurrentTime(0);
    setRealDuration(track.duration || 0);

    if (isPlaying) {
      audio.play().catch((err) => {
        console.log("Audio play failed:", err);
        setPlaying(false);
      });
    }
  }, [track?.audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !track?.audioUrl) return;

    if (isPlaying) {
      audio.play().catch((err) => {
        console.log("Audio play failed:", err);
        setPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, track?.audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.volume = volume;
  }, [volume]);

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTime(audio.currentTime);
  }

  function handleLoadedMetadata() {
    const audio = audioRef.current;
    if (!audio) return;

    setRealDuration(audio.duration || track?.duration || 0);
  }

  function handleEnded() {
    if (isRepeat) {
      const audio = audioRef.current;

      if (audio) {
        audio.currentTime = 0;
        audio.play();
      }

      return;
    }

    if (queue.length > 1) {
      playNext();
      return;
    }

    setPlaying(false);
    setCurrentTime(0);
  }

  function handleSeek(event: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    const value = Number(event.target.value);

    if (!audio) return;

    audio.currentTime = value;
    setCurrentTime(value);
  }

  const durationToShow = realDuration || track?.duration || 0;

  const progress =
    durationToShow > 0 ? Math.min((currentTime / durationToShow) * 100, 100) : 0;

  if (!track) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-30 hidden h-[92px] items-center justify-between border-t border-borderSoft bg-white/90 px-8 shadow-card backdrop-blur lg:flex">
        <div className="flex w-72 items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-lg bg-soft text-primary">
            <Music size={24} />
          </div>

          <div>
            <p className="font-bold text-textMain">No audio selected</p>
            <p className="text-sm text-textMuted">
              Open a story and play an audio part
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-textMuted">
          <Shuffle className="h-5 w-5" />
          <SkipBack />
          <button
            type="button"
            disabled
            className="grid h-14 w-14 place-items-center rounded-full bg-borderSoft text-textMuted"
          >
            <Play />
          </button>
          <SkipForward />
          <Repeat className="h-5 w-5" />
        </div>

        <div className="flex w-[430px] items-center gap-5">
          <span className="text-xs text-textMuted">00:00 / 00:00</span>
          <div className="h-1.5 flex-1 rounded-full bg-borderSoft" />
          <Volume2 />
          <ListMusic />
          <button
            type="button"
            onClick={toggleExpanded}
            className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-soft"
          >
            <ChevronUp />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {isExpanded && (
        <div className="fixed bottom-[92px] right-8 z-40 hidden w-[420px] rounded-[28px] bg-white p-5 shadow-card lg:block">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-textMain">Playing Queue</h3>
              <p className="text-sm text-textMuted">
                {queue.length} audio parts
              </p>
            </div>

            <button
              type="button"
              onClick={toggleExpanded}
              className="grid h-10 w-10 place-items-center rounded-full bg-soft text-primary"
            >
              <ChevronDown />
            </button>
          </div>

          <div className="max-h-[360px] space-y-3 overflow-y-auto">
            {queue.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  usePlayerStore.getState().setQueue(queue, index);
                }}
                className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                  index === currentIndex
                    ? "bg-primary text-white"
                    : "bg-page text-textMain hover:bg-soft"
                }`}
              >
                {item.cover ? (
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-soft text-primary">
                    <Music size={20} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-bold">{item.title}</p>
                  <p
                    className={`line-clamp-1 text-sm ${
                      index === currentIndex ? "text-white/70" : "text-textMuted"
                    }`}
                  >
                    {item.author}
                  </p>
                </div>

                {index === currentIndex && <Pause size={18} />}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-30 hidden h-[92px] items-center justify-between border-t border-borderSoft bg-white/90 px-8 shadow-card backdrop-blur lg:flex">
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          preload="metadata"
        />

        <div className="flex w-72 items-center gap-4">
          {track.cover ? (
            <img
              src={track.cover}
              alt={track.title}
              className="h-14 w-14 rounded-lg object-cover"
            />
          ) : (
            <div className="grid h-14 w-14 place-items-center rounded-lg bg-soft text-primary">
              <Music size={24} />
            </div>
          )}

          <div className="min-w-0">
            <p className="line-clamp-1 font-bold text-textMain">
              {track.title}
            </p>
            <p className="line-clamp-1 text-sm text-textMuted">
              by {track.author || "Unknown Author"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-textMain">
          <button
            type="button"
            onClick={toggleShuffle}
            className={isShuffle ? "text-primary" : "text-textMain"}
          >
            <Shuffle className="h-5 w-5" />
          </button>

          <button type="button" onClick={playPrevious}>
            <SkipBack />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            disabled={!track.audioUrl}
            className="grid h-14 w-14 place-items-center rounded-full bg-primary text-white shadow-soft disabled:bg-borderSoft disabled:text-textMuted"
          >
            {isPlaying ? <Pause /> : <Play />}
          </button>

          <button type="button" onClick={playNext}>
            <SkipForward />
          </button>

          <button
            type="button"
            onClick={toggleRepeat}
            className={isRepeat ? "text-primary" : "text-textMain"}
          >
            <Repeat className="h-5 w-5" />
          </button>
        </div>

        <div className="flex w-[430px] items-center gap-5">
          <span className="w-[88px] text-xs text-textMuted">
            {formatTime(currentTime)} / {formatTime(durationToShow)}
          </span>

          <div className="relative h-1.5 flex-1 rounded-full bg-borderSoft">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />

            <input
              type="range"
              min={0}
              max={durationToShow || 0}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>

          <div className="flex items-center gap-2">
            <Volume2 />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              className="w-16 accent-primary"
            />
          </div>

          <button type="button" onClick={toggleExpanded}>
            <ListMusic />
          </button>

          <button
            type="button"
            onClick={toggleExpanded}
            className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-soft"
          >
            {isExpanded ? <ChevronDown /> : <ChevronUp />}
          </button>
        </div>
      </div>
    </>
  );
}