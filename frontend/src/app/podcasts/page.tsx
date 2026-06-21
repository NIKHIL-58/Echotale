"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getPodcasts, type Story } from "@/services/storyService";
import { StoryGridCard } from "@/components/stories/StoryGridCard";
import { Mic } from "lucide-react";

export default function PodcastsPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadPodcasts() {
      try {
        setLoading(true);
        const data = await getPodcasts();
        setStories(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load podcasts"
        );
      } finally {
        setLoading(false);
      }
    }

    loadPodcasts();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-black text-[#10122d]">Podcasts</h1>
          <p className="mt-2 text-slate-500">
            Browse podcast-style audio stories and spoken content.
          </p>
        </div>

        {loading && <p className="text-slate-500">Loading podcasts...</p>}

        {errorMessage && (
          <div className="rounded-3xl bg-red-50 p-5 font-semibold text-red-600">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && stories.length === 0 && (
          <div className="rounded-[30px] bg-white p-10 text-center shadow-sm">
            <Mic className="mx-auto text-[#6c4df6]" size={52} />
            <h2 className="mt-4 text-2xl font-bold text-[#10122d]">
              No podcasts yet
            </h2>
            <p className="mt-2 text-slate-500">
              Upload content with category Podcast to show it here.
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