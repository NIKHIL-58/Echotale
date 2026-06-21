"use client";

import Link from "next/link";
import { BookOpen, Bookmark, Headphones, Play } from "lucide-react";
import { getMediaUrl, type Story } from "@/services/storyService";
import { isBookmarked, toggleBookmark } from "@/lib/userLists";
import { useState } from "react";

export function StoryGridCard({ story }: { story: Story }) {
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(story.id));

  function handleBookmark(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const result = toggleBookmark(story);
    setBookmarked(result);
  }

  const coverUrl = getMediaUrl(story.cover_image);
  const partsCount = story.audio_parts?.length || 0;

  return (
    <Link
      href={`/stories/${story.id}`}
      className="group overflow-hidden rounded-[28px] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-56 overflow-hidden bg-[#eee8ff]">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={story.title}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : null}

        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen size={46} className="text-[#6c4df6]" />
        </div>

        <button
          type="button"
          onClick={handleBookmark}
          className="absolute right-4 top-4 rounded-full bg-white/90 p-3 text-[#6c4df6] shadow"
        >
          <Bookmark
            size={18}
            fill={bookmarked ? "#6c4df6" : "none"}
          />
        </button>

        <div className="absolute bottom-4 right-4 rounded-full bg-[#6c4df6] p-4 text-white shadow-lg">
          <Play size={22} fill="white" />
        </div>
      </div>

      <div className="space-y-3 p-5">
        <div>
          <h3 className="line-clamp-1 text-lg font-bold text-[#10122d]">
            {story.title}
          </h3>
          <p className="line-clamp-1 text-sm text-slate-500">
            {story.author || "Unknown Author"}
          </p>
        </div>

        <p className="line-clamp-2 text-sm text-slate-500">
          {story.description || "No description available."}
        </p>

        <div className="flex items-center justify-between text-sm">
          <span className="rounded-full bg-[#eee8ff] px-4 py-2 font-semibold text-[#6c4df6]">
            {story.category || "Book"}
          </span>

          <span className="flex items-center gap-1 text-slate-500">
            <Headphones size={16} />
            {partsCount} parts
          </span>
        </div>

        {story.audio_status === "generating" && (
          <p className="text-sm font-semibold text-orange-500">
            Audio generating...
          </p>
        )}

        {story.audio_status === "failed" && (
          <p className="text-sm font-semibold text-red-500">
            Audio failed
          </p>
        )}
      </div>
    </Link>
  );
}