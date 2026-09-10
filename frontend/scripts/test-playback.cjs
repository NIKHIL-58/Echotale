/* No browser, network or real media: exercise the production controller with an event-driven audio fake. */
const { test, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
function loadTS(relative) {
  const filename = path.resolve(__dirname, "..", relative);
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = new Module(filename, module); mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename)); mod._compile(output, filename); return mod.exports;
}
const { usePlayerStore: store } = loadTS("src/store/playerStore.ts");
const { attachAudioController } = loadTS("src/lib/audioController.ts");
class AudioFake extends EventTarget {
  src = ""; currentTime = 0; duration = 120; paused = true; ended = false; error = null;
  playbackRate = 1; volume = 1; plays = []; loads = 0; playImpl = null;
  getAttribute(name) { return name === "src" ? this.src : null; }
  removeAttribute(name) { if (name === "src") this.src = ""; }
  load() { this.loads++; this.currentTime = 0; this.ended = false; this.error = null; }
  play() { this.paused = false; this.plays.push({ src: this.src, time: this.currentTime }); return this.playImpl ? this.playImpl() : Promise.resolve(); }
  pause() { const wasPaused = this.paused; this.paused = true; if (!wasPaused) this.emit("pause"); }
  emit(name) { this.dispatchEvent(new Event(name)); }
  ready() { this.emit("loadedmetadata"); }
  finish() { this.currentTime = this.duration; this.ended = true; this.paused = true; this.emit("ended"); }
}
const queue = [1,2,3].map(n => ({ id: "part-" + n, storyId: "story", chapterId: String(n), chapterNumber: n, title: "Part " + n, author: "Author", cover: "", duration: 120, audioUrl: "/part-" + n + ".mp3" }));
let controller;
function setup(restore = async () => null) {
  store.setState(store.getInitialState(), true);
  const audio = new AudioFake(), saved = [];
  controller = attachAudioController(audio, store, { restore, save: p => saved.push(p) });
  return { audio, saved };
}
const tick = () => new Promise(resolve => setImmediate(resolve));
afterEach(() => controller?.dispose());

test("one click plays all parts in order and stops at the final part", async () => {
  const { audio, saved } = setup();
  store.getState().setQueue(queue); await tick(); audio.ready();
  assert.equal(audio.plays[0].src, "/part-1.mp3");
  audio.finish(); audio.ready();
  assert.equal(store.getState().currentIndex, 1);
  assert.equal(audio.plays[1].src, "/part-2.mp3");
  audio.finish(); audio.ready(); audio.finish();
  assert.equal(store.getState().currentIndex, 2);
  assert.equal(store.getState().isPlaying, false);
  assert.equal(audio.plays.length, 3);
  assert.deepEqual(saved.filter(p => p.completed).map(p => p.chapter_id), ["1", "2", "3"]);
});
test("automatic transitions do not restore an old position in the next part", async () => {
  let restores = 0;
  const { audio } = setup(async track => { restores++; return { chapter_id: track.chapterId, current_time: 45, completed: false }; });
  store.getState().setQueue(queue); await tick(); audio.ready();
  assert.equal(audio.currentTime, 45);
  audio.finish(); audio.ready();
  assert.equal(audio.currentTime, 0); assert.equal(restores, 1);
});
test("selecting a later part continues to the following part", async () => {
  const { audio } = setup();
  store.getState().setQueue(queue, 1); await tick(); audio.ready(); audio.finish(); audio.ready();
  assert.equal(store.getState().currentIndex, 2); assert.equal(audio.plays.at(-1).src, "/part-3.mp3");
});
test("old play rejection cannot pause the new part", async () => {
  const { audio } = setup();
  let reject;
  audio.playImpl = () => new Promise((_, no) => { reject = no; });
  store.getState().setQueue(queue); await tick(); audio.ready();
  audio.playImpl = null; store.getState().playNext(); audio.ready();
  reject(new Error("interrupted by load")); await tick();
  assert.equal(store.getState().isPlaying, true); assert.equal(store.getState().playbackError, "");
});
test("repeat actually starts the same audio again", async () => {
  const { audio } = setup();
  store.getState().setQueue(queue); store.getState().toggleRepeat(); await tick(); audio.ready();
  audio.finish(); audio.ready();
  assert.equal(audio.plays.length, 2); assert.equal(audio.plays[1].src, "/part-1.mp3"); assert.equal(audio.currentTime, 0);
});
test("autoplay preference stops after the selected part", async () => {
  const { audio } = setup();
  store.getState().setAutoplay(false); store.getState().setQueue(queue); await tick(); audio.ready(); audio.finish();
  assert.equal(store.getState().currentIndex, 0); assert.equal(store.getState().isPlaying, false);
  store.getState().togglePlay(); await tick(); audio.ready();
  assert.equal(audio.currentTime, 0); assert.equal(audio.plays.length, 2);
});
test("track change saves the outgoing part rather than overwriting the incoming part", async () => {
  const { audio, saved } = setup();
  store.getState().setQueue(queue); await tick(); audio.ready();
  audio.currentTime = 33; audio.emit("timeupdate"); store.getState().playNext(); audio.ready();
  assert.equal(saved[0].chapter_id, "1"); assert.equal(saved[0].current_time, 33);
  assert.equal(saved.some(p => p.chapter_id === "2"), false);
});
test("late resume request cannot seek or load the wrong part", async () => {
  let resolve;
  const { audio } = setup(() => new Promise(yes => { resolve = yes; }));
  store.getState().setQueue(queue); store.getState().playNext(); audio.ready();
  resolve({ chapter_id: "1", current_time: 60 }); await tick();
  assert.equal(audio.src, "/part-2.mp3"); assert.equal(audio.currentTime, 0);
});
test("queued timestamp seek wins over resume when metadata arrives", async () => {
  const { audio } = setup(async () => ({ chapter_id: "2", current_time: 18 }));
  store.getState().setQueue(queue, 1); store.getState().requestSeek(51); await tick(); audio.ready();
  assert.equal(audio.currentTime, 51);
});
test("blocked playback shows a recoverable error", async () => {
  const { audio } = setup();
  audio.playImpl = () => Promise.reject(new Error("NotAllowedError"));
  store.getState().setQueue(queue); await tick(); audio.ready(); await tick();
  assert.equal(store.getState().isPlaying, false); assert.match(store.getState().playbackError, /Tap play/);
  audio.playImpl = null; store.getState().togglePlay(); await tick();
  assert.equal(store.getState().isPlaying, true); assert.equal(store.getState().playbackError, "");
});
test("expired sleep timer prevents starting the next part", async () => {
  const { audio } = setup();
  store.getState().setQueue(queue); await tick(); audio.ready();
  store.setState({ sleepTimerEnd: Date.now() - 1 }); audio.finish();
  assert.equal(audio.plays.length, 1); assert.equal(store.getState().isPlaying, false);
});
test("changing routes does not own or replace the audio controller", () => {
  const root = fs.readFileSync(path.resolve(__dirname, "../src/app/layout.tsx"), "utf8");
  const perPage = fs.readFileSync(path.resolve(__dirname, "../src/components/layout/AppLayout.tsx"), "utf8");
  assert.match(root, /<BottomPlayer/); assert.doesNotMatch(perPage, /<BottomPlayer/);
});
test("clearing playback pauses audio and empties the source", async () => {
  const { audio } = setup(); store.getState().setQueue(queue); await tick(); audio.ready(); store.getState().clearTrack();
  assert.equal(audio.paused, true); assert.equal(audio.src, ""); assert.equal(store.getState().track, null);
});

test("retry after a media error reloads the failed part", async () => {
  const { audio } = setup(); store.getState().setQueue(queue); await tick(); audio.ready();
  audio.currentTime = 22; audio.error = { code: 2 }; audio.emit("error");
  assert.equal(store.getState().isPlaying, false);
  const loads = audio.loads; store.getState().togglePlay(); await tick(); audio.ready();
  assert.ok(audio.loads > loads); assert.equal(audio.src, "/part-1.mp3");
  assert.equal(store.getState().isPlaying, true);
});

test("external audio pauses are reflected in the controls", async () => {
  const { audio } = setup(); store.getState().setQueue(queue); await tick(); audio.ready();
  audio.pause(); assert.equal(store.getState().isPlaying, false);
});

test("the final part remains seekable after playback completes", async () => {
  const { audio } = setup(); store.getState().setQueue(queue, 2); await tick(); audio.ready(); audio.finish();
  store.getState().requestSeek(30);
  assert.equal(audio.currentTime, 30); assert.equal(store.getState().currentTime, 30);
});
