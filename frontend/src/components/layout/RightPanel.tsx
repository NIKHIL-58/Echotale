"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Clock3, Headphones, TrendingUp } from "lucide-react";
import { getHistory } from "@/lib/userLists";
import type { Story } from "@/services/storyService";

type ProgressStats = {
  minutes: number;
  storiesCompleted: number;
  chaptersFinished: number;
};

function calculateStats(history: Story[]): ProgressStats {
  const uniqueStories = new Map<string, Story>();

  history.forEach((story) => {
    if (story?.id) {
      uniqueStories.set(story.id, story);
    }
  });

  const stories = Array.from(uniqueStories.values());

  const minutes = stories.reduce((total, story) => {
    return total + (story.duration || 0);
  }, 0);

  const chaptersFinished = stories.reduce((total, story) => {
    return total + (story.audio_parts?.length || 0);
  }, 0);

  return {
    minutes,
    storiesCompleted: stories.length,
    chaptersFinished,
  };
}

function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

export function RightPanel() {
  const [stats, setStats] = useState<ProgressStats>({
    minutes: 0,
    storiesCompleted: 0,
    chaptersFinished: 0,
  });

  useEffect(() => {
    function loadStats() {
      const history = getHistory();
      setStats(calculateStats(history));
    }

    loadStats();

    window.addEventListener("storage", loadStats);

    const interval = setInterval(loadStats, 3000);

    return () => {
      window.removeEventListener("storage", loadStats);
      clearInterval(interval);
    };
  }, []);

  const progressPercent = Math.min(100, Math.round((stats.minutes / 120) * 100));

  return (
    <aside className="hidden w-80 shrink-0 space-y-6 xl:block">
      <section className="rounded-[28px] bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-textMain">Your Progress</h3>
          <span className="text-xs text-textMuted">This Week</span>
        </div>

        <div className="mt-8 flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-primary text-white shadow-[0_10px_24px_rgba(108,77,246,0.25)]">
            <Headphones size={24} />
          </div>

          <div>
            <p className="text-xl font-bold text-textMain">
              {formatTime(stats.minutes)}
            </p>
            <p className="text-sm text-textMuted">Time listened</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs text-textMuted">
            <span>Goal progress</span>
            <span>{progressPercent}%</span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-soft">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-page p-4">
            <BookOpen className="mb-2 text-primary" size={20} />
            <b className="text-lg text-textMain">{stats.storiesCompleted}</b>
            <p className="mt-1 text-xs text-textMuted">Stories Opened</p>
          </div>

          <div className="rounded-2xl bg-page p-4">
            <Clock3 className="mb-2 text-primary" size={20} />
            <b className="text-lg text-textMain">{stats.chaptersFinished}</b>
            <p className="mt-1 text-xs text-textMuted">Audio Parts</p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-5 shadow-soft">
        <div className="mb-4 flex justify-between">
          <h3 className="font-bold text-textMain">Recommended For You</h3>
          <Link className="text-sm text-primary" href="/explore">
            View all
          </Link>
        </div>

        <div className="rounded-2xl bg-page p-4">
          <TrendingUp className="mb-3 text-primary" size={22} />
          <p className="text-sm text-textMuted">
            Recommendations will improve after you listen to more stories.
          </p>
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-5 shadow-soft">
        <div className="mb-4 flex justify-between">
          <h3 className="font-bold text-textMain">Popular Authors</h3>
          <Link className="text-sm text-primary" href="/explore">
            View all
          </Link>
        </div>

        <p className="text-sm text-textMuted">
          Popular authors will appear here soon.
        </p>
      </section>
    </aside>
  );
}