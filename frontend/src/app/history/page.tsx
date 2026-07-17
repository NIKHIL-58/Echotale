"use client";

import { useEffect, useState } from "react";
import { Clock, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getStories, type Story } from "@/services/storyService";
import { clearHistory, getHistory } from "@/lib/userLists";
import { StoryGridCard } from "@/components/stories/StoryGridCard";
import { clearServerHistory, getServerHistory, resolveStories } from "@/services/appService";
import { getToken } from "@/lib/auth";

export default function HistoryPage() {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    async function loadHistory() {
      if (!getToken()) {
        setStories(getHistory());
        return;
      }
      const [entries, allStories] = await Promise.all([
        getServerHistory(),
        getStories(),
      ]);
      setStories(resolveStories(entries, allStories));
    }
    loadHistory().catch(() => setStories([]));
  }, []);

  async function handleClear() {
    if (getToken()) {
      await clearServerHistory();
    } else {
      clearHistory();
    }
    setStories([]);
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-4xl font-black text-[#10122d]">History</h1>
            <p className="mt-2 text-slate-500">
              Recently opened and played stories.
            </p>
          </div>

          {stories.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-red-50 px-5 py-3 font-bold text-red-600"
            >
              <Trash2 size={18} />
              Clear History
            </button>
          )}
        </div>

        {stories.length === 0 ? (
          <div className="rounded-[30px] bg-white p-10 text-center shadow-sm">
            <Clock className="mx-auto text-[#6c4df6]" size={52} />
            <h2 className="mt-4 text-2xl font-bold text-[#10122d]">
              No listening history
            </h2>
            <p className="mt-2 text-slate-500">
              Open or play a story and it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {stories.map((story) => (
              <StoryGridCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}