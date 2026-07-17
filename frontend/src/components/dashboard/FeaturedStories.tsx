"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StoryGridCard } from "@/components/stories/StoryGridCard";
import { getStories, type Story } from "@/services/storyService";

export function FeaturedStories() {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    getStories().then((items) => setStories(items.slice(0, 3))).catch(() => setStories([]));
  }, []);

  return (
    <section className="mt-6">
      <div className="mb-4 flex justify-between">
        <h2 className="text-lg font-bold">Featured Stories</h2>
        <Link className="text-sm text-primary" href="/explore">View all</Link>
      </div>
      {stories.length === 0 ? (
        <div className="rounded-widget bg-white p-5 shadow-soft">
          <p className="font-semibold">No featured stories yet</p>
          <p className="mt-1 text-sm text-textMuted">Upload a story to see it here.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {stories.map((story) => <StoryGridCard key={story.id} story={story} />)}
        </div>
      )}
    </section>
  );
}
