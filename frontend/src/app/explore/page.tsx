"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { getMediaUrl, getStories, Story } from "@/services/storyService";
import { BookOpen, Headphones, Loader2, Play, Plus } from "lucide-react";

export default function ExplorePage() {
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
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-textMain">
            {typeQuery === "audiobooks" ? "Audiobooks" : "Explore Stories"}
          </h1>

          <p className="mt-2 text-textMuted">
            {searchQuery
              ? `Search results for "${searchQuery}"`
              : "Discover real stories uploaded by EchoTale users."}
          </p>
        </div>

        <Link
          href="/stories/upload"
          className="inline-flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-primary px-6 font-bold text-white shadow-[0_12px_28px_rgba(108,77,246,0.24)]"
        >
          <Plus size={20} />
          Upload Story
        </Link>
      </div>

      {loading && (
        <div className="grid min-h-[45vh] place-items-center">
          <div className="flex items-center gap-3 rounded-3xl bg-white px-6 py-5 shadow-soft">
            <Loader2 className="animate-spin text-primary" />
            <span className="font-semibold">Loading stories...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-50 px-5 py-4 font-semibold text-red-600">
          {error}
        </div>
      )}

      {!loading && !filteredStories.length && (
        <div className="rounded-[28px] bg-white p-10 text-center shadow-soft">
          <h2 className="text-2xl font-bold text-textMain">
            No stories found
          </h2>
          <p className="mt-2 text-textMuted">
            Try another search or upload a new PDF story.
          </p>

          <Link
            href="/stories/upload"
            className="mt-6 inline-flex rounded-2xl bg-primary px-6 py-3 font-bold text-white"
          >
            Upload Story
          </Link>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredStories.map((story) => {
          const coverUrl = getMediaUrl(story.cover_image);
          const partsCount = story.audio_parts?.length || 0;

          return (
            <Link
              href={`/stories/${story.id}`}
              key={story.id}
              className="group overflow-hidden rounded-[28px] bg-white p-4 shadow-soft transition hover:-translate-y-1 hover:shadow-card"
            >
              <div className="relative h-56 overflow-hidden rounded-[22px] bg-soft">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={story.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full place-items-center bg-gradient-to-br from-[#2B1B7A] to-[#A855F7] text-white">
                    <BookOpen size={46} />
                  </div>
                )}

                <div className="absolute bottom-4 right-4 grid h-12 w-12 place-items-center rounded-full bg-white text-primary shadow-card">
                  <Play size={22} />
                </div>
              </div>

              <div className="mt-4">
                <h2 className="line-clamp-2 text-xl font-extrabold text-textMain">
                  {story.title}
                </h2>

                <p className="mt-1 text-textMuted">
                  by {story.author || "Unknown Author"}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded-full bg-soft px-3 py-1 font-bold text-primary">
                    {story.category || "Book"}
                  </span>

                  <span className="rounded-full bg-page px-3 py-1 font-bold text-textMuted">
                    {story.duration || 0} min
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full bg-page px-3 py-1 font-bold text-textMuted">
                    <Headphones size={14} />
                    {partsCount} parts
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </AppLayout>
  );
}