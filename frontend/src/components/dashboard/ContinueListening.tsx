"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StoryGridCard } from "@/components/stories/StoryGridCard";
import { getHistory } from "@/lib/userLists";
import { getToken } from "@/lib/auth";
import { getServerHistory, resolveStories } from "@/services/appService";
import { getStories, type Story } from "@/services/storyService";

export function ContinueListening() {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    if (!getToken()) {
      setStories(getHistory().slice(0, 3));
      return;
    }
    Promise.all([getServerHistory(), getStories()])
      .then(([entries, allStories]) => setStories(resolveStories(entries, allStories).slice(0, 3)))
      .catch(() => setStories([]));
  }, []);

  return (
    <section className="mt-6">
      <div className="mb-4 flex justify-between">
        <h2 className="text-lg font-bold">Continue Listening</h2>
        <Link className="text-sm text-primary" href="/history">View all</Link>
      </div>
      {stories.length === 0 ? (
        <div className="rounded-widget bg-white p-5 shadow-soft">
          <p className="font-semibold">No listening progress yet</p>
          <p className="mt-1 text-sm text-textMuted">Start playing a story and it will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {stories.map((story) => <StoryGridCard key={story.id} story={story} />)}
        </div>
      )}
    </section>
  );
}
