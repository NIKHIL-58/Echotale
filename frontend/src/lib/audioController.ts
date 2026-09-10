import type { PlayerState, PlayerTrack } from "../store/playerStore";

type Progress = { story_id: string; chapter_id: string; current_time: number; duration: number; percentage: number; completed: boolean };
type Store = { getState: () => PlayerState; subscribe: (fn: (s: PlayerState, previous: PlayerState) => void) => () => void };
type Persistence = { restore: (track: PlayerTrack) => Promise<Progress | null>; save: (value: Progress) => void };

/** Owns one audio element across routes. A generation token rejects stale load/play callbacks. */
export function attachAudioController(audio: HTMLAudioElement, store: Store, persistence: Persistence) {
  let generation = 0, playAttempt = 0, loaded = false, active: PlayerTrack | null = null;
  let restoreTime = 0, lastSavedAt = 0, pendingSeek: number | null = null;
  const timing = () => {
    const duration = Number.isFinite(audio.duration) ? audio.duration : active?.duration || 0;
    store.getState().setTiming(audio.currentTime || 0, duration);
  };
  const persist = (completed = false) => {
    if (!active || !loaded || (!audio.currentTime && !completed)) return;
    const duration = Number.isFinite(audio.duration) ? audio.duration : active.duration || 0;
    persistence.save({ story_id: active.storyId, chapter_id: active.chapterId || "",
      current_time: audio.currentTime || 0, duration,
      percentage: duration ? Math.min(100, audio.currentTime / duration * 100) : 0, completed });
    lastSavedAt = Date.now();
  };
  const play = () => {
    if (!loaded || !active || !store.getState().isPlaying) return;
    const token = generation, attempt = ++playAttempt;
    audio.play().catch(() => {
      if (token === generation && attempt === playAttempt && store.getState().isPlaying) {
        store.getState().setPlaybackError("Playback paused. Tap play to continue; your browser may require a new interaction.");
      }
    });
  };
  const load = async (state: PlayerState) => {
    persist(); ++generation; ++playAttempt; loaded = false;
    audio.pause(); active = state.track; pendingSeek = null; restoreTime = 0;
    audio.removeAttribute("src");
    if (!active?.audioUrl) { audio.load(); return; }
    const token = generation;
    const track = active;
    // Bound progress lookup so an unavailable API never blocks listening.
    if (state.resumeOnLoad) {
      let timeout: ReturnType<typeof setTimeout> | undefined;
      const saved = await Promise.race([
        persistence.restore(track).catch(() => null),
        new Promise<null>(resolve => { timeout = setTimeout(() => resolve(null), 900); }),
      ]);
      clearTimeout(timeout);
      if (token !== generation) return;
      if (saved?.chapter_id === (track.chapterId || "") && !saved.completed) restoreTime = Math.max(0, saved.current_time || 0);
    }
    if (token !== generation) return;
    audio.src = track.audioUrl!;
    audio.load();
  };
  const metadata = () => {
    if (!active || !audio.getAttribute("src")) return;
    loaded = true; lastSavedAt = Date.now();
    const target = pendingSeek ?? restoreTime;
    audio.currentTime = Number.isFinite(audio.duration) && target < audio.duration - 1 ? target : 0;
    pendingSeek = null; restoreTime = 0;
    audio.playbackRate = store.getState().playbackRate;
    audio.volume = store.getState().volume;
    timing(); play();
  };
  const update = () => { if (!loaded) return; timing(); if (Date.now() - lastSavedAt >= 15000) persist(); };
  const ended = () => {
    if (!loaded) return;
    timing(); persist(true); loaded = false;
    store.getState().advanceAfterEnd();
  };
  const failed = () => {
    if (active && audio.error) store.getState().setPlaybackError("This audio part could not be loaded. Check your connection or download it for offline listening.");
  };
  const paused = () => {
    if (!loaded) return;
    persist();
    if (audio.paused && !audio.ended && store.getState().isPlaying) store.getState().setPlaying(false);
  };
  const unsubscribe = store.subscribe((s, prev) => {
    if (s.loadId !== prev.loadId) { void load(s); return; }
    if (s.seekRequest !== prev.seekRequest && s.seekRequest) {
      // The final part is still seekable after its ended event.
      if (!loaded && audio.ended && audio.getAttribute("src")) loaded = true;
      if (loaded) {
        audio.currentTime = Math.max(0, Math.min(s.seekRequest.value, Number.isFinite(audio.duration) ? audio.duration : s.duration));
        timing(); persist();
      } else pendingSeek = s.seekRequest.value;
    }
    if (s.playbackRate !== prev.playbackRate) audio.playbackRate = s.playbackRate;
    if (s.volume !== prev.volume) audio.volume = s.volume;
    if (s.isPlaying !== prev.isPlaying) {
      if (s.isPlaying) {
        if (!loaded && active && audio.ended) { store.getState().setQueue(s.queue, s.currentIndex); return; }
        if (audio.error) { void load({ ...s, resumeOnLoad: true }); return; }
        play();
      } else { ++playAttempt; audio.pause(); persist(); }
    }
  });
  audio.addEventListener("loadedmetadata", metadata);
  audio.addEventListener("timeupdate", update);
  audio.addEventListener("ended", ended);
  audio.addEventListener("error", failed);
  audio.addEventListener("pause", paused);
  void load(store.getState());
  return {
    persist,
    dispose: () => {
      persist(); ++generation; ++playAttempt; unsubscribe();
      audio.removeEventListener("loadedmetadata", metadata);
      audio.removeEventListener("timeupdate", update);
      audio.removeEventListener("ended", ended);
      audio.removeEventListener("error", failed);
      audio.removeEventListener("pause", paused);
      audio.pause(); audio.removeAttribute("src"); audio.load();
    },
  };
}
