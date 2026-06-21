"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import type { Story } from "@/services/storyService";
import { getBookmarks } from "@/lib/userLists";
import { StoryGridCard } from "@/components/stories/StoryGridCard";

export default function BookmarksPage() {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    setStories(getBookmarks());
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-black text-[#10122d]">Bookmarks</h1>
          <p className="mt-2 text-slate-500">
            Stories you saved for later.
          </p>
        </div>

        {stories.length === 0 ? (
          <div className="rounded-[30px] bg-white p-10 text-center shadow-sm">
            <Bookmark className="mx-auto text-[#6c4df6]" size={52} />
            <h2 className="mt-4 text-2xl font-bold text-[#10122d]">
              No bookmarks yet
            </h2>
            <p className="mt-2 text-slate-500">
              Open a story and tap bookmark to save it here.
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