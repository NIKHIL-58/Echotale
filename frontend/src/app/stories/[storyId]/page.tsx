"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getMediaUrl, getStory, Story } from "@/services/storyService";
import {
  BookOpen,
  Download,
  FileText,
  Headphones,
  Loader2,
  Play,
  Star,
} from "lucide-react";

export default function StoryDetailPage() {
  const params = useParams();
  const storyId = params.storyId as string;

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStory() {
    try {
      setLoading(true);
      setError("");

      const data = await getStory(storyId);
      setStory(data);
    } catch {
      setError("Unable to load story.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (storyId) {
      loadStory();
    }
  }, [storyId]);

  if (loading) {
    return (
      <AppLayout rightPanel={false}>
        <div className="grid min-h-[60vh] place-items-center">
          <div className="flex items-center gap-3 rounded-3xl bg-white px-6 py-5 shadow-soft">
            <Loader2 className="animate-spin text-primary" />
            <span className="font-semibold text-textMain">
              Loading story...
            </span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !story) {
    return (
      <AppLayout rightPanel={false}>
        <div className="rounded-widget bg-white p-8 shadow-soft">
          <h1 className="text-2xl font-bold text-textMain">
            Story not found
          </h1>
          <p className="mt-2 text-textMuted">
            {error || "This story does not exist."}
          </p>
        </div>
      </AppLayout>
    );
  }

  const coverUrl = getMediaUrl(story.cover_image);
  const bookUrl = getMediaUrl(story.book_url);
  const audioUrl = getMediaUrl(story.audio_url);

  return (
    <AppLayout rightPanel={false}>
      <section className="grid gap-8 rounded-[32px] bg-white p-6 shadow-soft md:grid-cols-[300px_1fr]">
        <div className="overflow-hidden rounded-[28px] bg-soft">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={story.title}
              className="h-[420px] w-full object-cover"
            />
          ) : (
            <div className="grid h-[420px] place-items-center bg-gradient-to-br from-[#2B1B7A] to-[#A855F7] text-white">
              <BookOpen size={64} />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <Badge>{story.category || "Book"}</Badge>

          <h1 className="mt-4 text-4xl font-extrabold text-textMain">
            {story.title}
          </h1>

          <p className="mt-3 text-lg text-textMuted">
            by {story.author || "Unknown Author"}
          </p>

          <div className="mt-5 flex flex-wrap gap-3 text-sm text-textMuted">
            <span className="inline-flex items-center gap-2 rounded-full bg-page px-4 py-2">
              <Star size={16} className="text-yellow-500" />
              {story.rating || 0} rating
            </span>

            <span className="inline-flex items-center gap-2 rounded-full bg-page px-4 py-2">
              <Headphones size={16} />
              {story.total_listens || 0} listens
            </span>

            <span className="inline-flex items-center gap-2 rounded-full bg-page px-4 py-2">
              <FileText size={16} />
              {story.duration || 0} min
            </span>
          </div>

          <p className="mt-6 max-w-3xl leading-7 text-textMuted">
            {story.description || "No description available for this story."}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            {audioUrl ? (
              <audio controls className="w-full max-w-xl">
                <source src={audioUrl} />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <div className="rounded-2xl bg-yellow-50 px-5 py-4 text-sm font-semibold text-yellow-700">
                No audio uploaded for this story yet.
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {audioUrl && (
              <a
                href={audioUrl}
                target="_blank"
                className="inline-flex h-[52px] items-center gap-2 rounded-2xl bg-primary px-6 font-bold text-white shadow-[0_12px_28px_rgba(108,77,246,0.25)]"
              >
                <Play size={20} />
                Open Audio
              </a>
            )}

            {bookUrl && (
              <a
                href={bookUrl}
                target="_blank"
                className="inline-flex h-[52px] items-center gap-2 rounded-2xl bg-soft px-6 font-bold text-primary"
              >
                <Download size={20} />
                Open PDF
              </a>
            )}
          </div>

          {story.tags?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {story.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-page px-4 py-2 text-sm font-semibold text-textMuted"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
}