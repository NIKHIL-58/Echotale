"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { getMediaUrl, getStories, Story } from "@/services/storyService";
import { BookOpen, Headphones, Loader2, Play, Plus } from "lucide-react";

function ExploreContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const typeQuery = searchParams.get("type") || "";

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStories() {
    try {
      setLoading(true);
      setError("");

      const data = await getStories();
      setStories(data);
    } catch {
      setError("Unable to load stories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStories();
  }, []);

  const filteredStories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let result = stories;

    if (typeQuery === "audiobooks") {
      result = result.filter(
        (story) =>
          story.audio_status === "generated" ||
          story.audio_status === "generating" ||
          (story.audio_parts?.length || 0) > 0
      );
    }

    if (query) {
      result = result.filter((story) => {
        return (
          story.title?.toLowerCase().includes(query) ||
          story.author?.toLowerCase().includes(query) ||
          story.category?.toLowerCase().includes(query) ||
          story.description?.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [stories, searchQuery, typeQuery]);

  return (
    <AppLayout rightPanel={false}>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold">Explore Stories</h1>
          <p className="mt-2 text-textMuted">
            Browse uploaded books, generated audiobooks, and stories.
          </p>
        </div>

        <Link
          href="/stories/upload"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white"
        >
          <Plus size={18} />
          Upload Story
        </Link>
      </div>

      {searchQuery && (
        <div className="mb-6 rounded-widget bg-white p-4 shadow-soft">
          <p className="text-sm text-textMuted">
            Showing results for{" "}
            <span className="font-semibold text-text">"{searchQuery}"</span>
          </p>
        </div>
      )}

      {loading && (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={36} />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-widget bg-white p-6 text-red-500 shadow-soft">
          {error}
        </div>
      )}

      {!loading && !error && filteredStories.length === 0 && (
        <div className="rounded-widget bg-white p-8 text-center shadow-soft">
          <BookOpen className="mx-auto text-textMuted" size={42} />
          <h2 className="mt-4 text-xl font-bold">No stories found</h2>
          <p className="mt-2 text-textMuted">
            Upload a PDF story to generate audio and see it here.
          </p>
        </div>
      )}

      {!loading && !error && filteredStories.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredStories.map((story) => (
            <Link
              href={`/stories/${story.id}`}
              key={story.id}
              className="group overflow-hidden rounded-widget bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-card"
            >
              <div className="relative h-56 bg-soft">
                {story.cover_image ? (
                  <img
                    src={getMediaUrl(story.cover_image)}
                    alt={story.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="text-textMuted" size={48} />
                  </div>
                )}

                <div className="absolute bottom-4 right-4 grid h-12 w-12 place-items-center rounded-full bg-primary text-white shadow-card">
                  <Play size={20} fill="currentColor" />
                </div>
              </div>

              <div className="p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-primary">
                    {story.category || "Story"}
                  </span>

                  {(story.audio_parts?.length || 0) > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-textMuted">
                      <Headphones size={14} />
                      {story.audio_parts?.length} parts
                    </span>
                  )}
                </div>

                <h2 className="line-clamp-2 text-lg font-bold">
                  {story.title}
                </h2>

                <p className="mt-1 text-sm text-textMuted">
                  by {story.author || "Unknown Author"}
                </p>

                <p className="mt-3 line-clamp-2 text-sm text-textMuted">
                  {story.description || "No description available."}
                </p>

                {story.audio_status === "generating" && (
                  <p className="mt-4 text-sm font-semibold text-primary">
                    Audio is generating...
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={null}>
      <ExploreContent />
    </Suspense>
  );
}