"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { getMediaUrl, getStories, Story } from "@/services/storyService";
import { BookOpen, Loader2, Play, Plus } from "lucide-react";

export default function ExplorePage() {
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

  return (
    <AppLayout rightPanel={false}>
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-textMain">
            Explore Stories
          </h1>
          <p className="mt-2 text-textMuted">
            Discover real stories uploaded by EchoTale users.
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

      {!loading && !stories.length && (
        <div className="rounded-[28px] bg-white p-10 text-center shadow-soft">
          <h2 className="text-2xl font-bold text-textMain">
            No stories uploaded yet
          </h2>
          <p className="mt-2 text-textMuted">
            Upload your first PDF story.
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
        {stories.map((story) => {
          const coverUrl = getMediaUrl(story.cover_image);

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

                <button
                  type="button"
                  className="absolute bottom-4 right-4 grid h-12 w-12 place-items-center rounded-full bg-white text-primary shadow-card"
                >
                  <Play size={22} />
                </button>
              </div>

              <div className="mt-4">
                <h2 className="line-clamp-2 text-xl font-extrabold text-textMain">
                  {story.title}
                </h2>

                <p className="mt-1 text-textMuted">
                  by {story.author || "Unknown Author"}
                </p>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="rounded-full bg-soft px-3 py-1 font-bold text-primary">
                    {story.category || "Book"}
                  </span>

                  <span className="text-textMuted">
                    {story.duration || 0} min
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