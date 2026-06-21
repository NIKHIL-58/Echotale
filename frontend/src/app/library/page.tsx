"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getStories, type Story } from "@/services/storyService";
import { StoryGridCard } from "@/components/stories/StoryGridCard";

export default function LibraryPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadLibrary() {
      try {
        setLoading(true);
        const data = await getStories();
        setStories(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load library"
        );
      } finally {
        setLoading(false);
      }
    }

    loadLibrary();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-4xl font-black text-[#10122d]">My Library</h1>
            <p className="mt-2 text-slate-500">
              All uploaded books and generated audiobooks.
            </p>
          </div>

          <Link
            href="/stories/upload"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6c4df6] px-6 py-3 font-bold text-white shadow-lg"
          >
            <Plus size={18} />
            Upload Story
          </Link>
        </div>

        {loading && <p className="text-slate-500">Loading library...</p>}

        {errorMessage && (
          <div className="rounded-3xl bg-red-50 p-5 font-semibold text-red-600">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && stories.length === 0 && (
          <div className="rounded-[30px] bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-[#10122d]">
              Your library is empty
            </h2>
            <p className="mt-2 text-slate-500">
              Upload your first PDF story to start listening.
            </p>
            <Link
              href="/stories/upload"
              className="mt-6 inline-flex rounded-full bg-[#6c4df6] px-6 py-3 font-bold text-white"
            >
              Upload Story
            </Link>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {stories.map((story) => (
            <StoryGridCard key={story.id} story={story} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}