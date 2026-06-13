import { Music } from "lucide-react";
import { PlayerControls } from "./PlayerControls";
import { ProgressBar } from "./ProgressBar";

export function ExpandedPlayer() {
  return (
    <section className="rounded-[32px] bg-deep p-8 text-white shadow-card">
      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        <div className="flex h-[340px] w-full items-center justify-center rounded-[24px] bg-white/10">
          <Music size={72} className="text-white/60" />
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-white/70">Now Playing</p>
          <h1 className="mt-2 text-4xl font-bold">No story selected</h1>
          <p className="mt-2 text-white/70">
            Choose an audio story to start listening.
          </p>

          <div className="my-10">
            <ProgressBar value={0} />
          </div>

          <PlayerControls />
        </div>
      </div>
    </section>
  );
}