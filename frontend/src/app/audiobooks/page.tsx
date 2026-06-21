"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getAudiobooks, type Story } from "@/services/storyService";
import { StoryGridCard } from "@/components/stories/StoryGridCard";
import { Headphones } from "lucide-react";

export default function AudiobooksPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadAudiobooks() {
      try {
        setLoading(true);
        const data = await getAudiobooks();
        setStories(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load audiobooks"
        );
      } finally {
        setLoading(false);
      }
    }

    loadAudiobooks();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-black text-[#10122d]">Audiobooks</h1>
          <p className="mt-2 text-slate-500">
            Listen to AI-generated audio versions of uploaded books.
          </p>
        </div>

        {loading && <p className="text-slate-500">Loading audiobooks...</p>}

        {errorMessage && (
          <div className="rounded-3xl bg-red-50 p-5 font-semibold text-red-600">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && stories.length === 0 && (
          <div className="rounded-[30px] bg-white p-10 text-center shadow-sm">
            <Headphones className="mx-auto text-[#6c4df6]" size={52} />
            <h2 className="mt-4 text-2xl font-bold text-[#10122d]">
              No audiobooks yet
            </h2>
            <p className="mt-2 text-slate-500">
              Upload a PDF story and wait for audio generation to finish.
            </p>
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