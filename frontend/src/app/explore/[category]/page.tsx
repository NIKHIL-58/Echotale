"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { StoryGridCard } from "@/components/stories/StoryGridCard";
import { getStories, type Story } from "@/services/storyService";

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [stories, setStories] = useState<Story[]>([]);
  const readableCategory = decodeURIComponent(category || "");

  useEffect(() => {
    getStories().then(setStories).catch(() => setStories([]));
  }, []);

  const filtered = useMemo(
    () => stories.filter((story) => story.category?.toLowerCase() === readableCategory.toLowerCase()),
    [stories, readableCategory],
  );

  return (
    <AppLayout>
      <h1 className="text-3xl font-bold capitalize">{readableCategory}</h1>
      <p className="mt-2 text-textMuted">Stories published in this category.</p>
      {filtered.length === 0 ? (
        <p className="mt-6 rounded-widget bg-white p-6 text-textMuted shadow-soft">
          No stories are available in this category yet.
        </p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((story) => <StoryGridCard key={story.id} story={story} />)}
        </div>
      )}
    </AppLayout>
  );
}
