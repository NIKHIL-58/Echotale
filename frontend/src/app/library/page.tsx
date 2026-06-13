"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { getMediaUrl, getStories, Story } from "@/services/storyService";
import { BookOpen, Headphones, Loader2, Play } from "lucide-react";

const filters = ["All", "Downloaded", "Playlists", "Completed"];

export default function LibraryPage() {
  const [activeFilter, setActiveFilter] = useState("All");
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
      setError("Unable to load library.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStories();
  }, []);

  const filteredStories =
    activeFilter === "Completed"
      ? stories.filter((story) => story.audio_status === "generated")
      : stories;

  return (
    <AppLayout rightPanel={false}>
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-textMain">My Library</h1>

        <div className="mt-6 flex flex-wrap gap-3">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-6 py-3 font-bold transition ${
                activeFilter === filter
                  ? "bg-primary text-white"
                  : "bg-white text-textMuted shadow-soft"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="grid min-h-[40vh] place-items-center">
          <div className="flex items-center gap-3 rounded-3xl bg-white px-6 py-5 shadow-soft">
            <Loader2 className="animate-spin text-primary" />
            <span className="font-semibold text-textMain">
              Loading library...
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-50 px-5 py-4 font-semibold text-red-600">
          {error}
        </div>
      )}

      {!loading && filteredStories.length === 0 && (
        <div className="rounded-[28px] bg-white p-10 text-center shadow-soft">
          <BookOpen className="mx-auto text-primary" size={54} />
          <h2 className="mt-4 text-2xl font-bold text-textMain">
            No books in this section
          </h2>
          <p className="mt-2 text-textMuted">
            Upload a PDF story or generate audio first.
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
              key={story.id}
              href={`/stories/${story.id}`}
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

                  <span className="inline-flex items-center gap-1 rounded-full bg-page px-3 py-1 font-bold text-textMuted">
                    <Headphones size={14} />
                    {partsCount} audio parts
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 font-bold ${
                      story.audio_status === "generated"
                        ? "bg-green-50 text-green-700"
                        : story.audio_status === "generating"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {story.audio_status || "not_generated"}
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