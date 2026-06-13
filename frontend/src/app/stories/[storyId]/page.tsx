"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { usePlayerStore } from "@/store/playerStore";
import {
  getMediaUrl,
  getStory,
  regenerateAudioParts,
  Story,
} from "@/services/storyService";
import {
  BookOpen,
  Download,
  FileText,
  Headphones,
  Loader2,
  Play,
  RefreshCcw,
  Star,
} from "lucide-react";

export default function StoryDetailPage() {
  const params = useParams();
  const storyId = params.storyId as string;

  const setTrack = usePlayerStore((state) => state.setTrack);

  const [story, setStory] = useState<Story | null>(null);
  const [selectedPart, setSelectedPart] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  async function loadStory(showLoader = true) {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const data = await getStory(storyId);
      setStory(data);
    } catch {
      setError("Unable to load story.");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }

  async function handleGenerateAudioParts() {
    try {
      setGenerating(true);
      setError("");

      const updatedStory = await regenerateAudioParts(storyId);
      setStory(updatedStory);
      setSelectedPart(0);
    } catch (err: any) {
      setError(err.message || "Audio generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  function handleSelectAudioPart(index: number) {
  if (!story) return;

  const audioParts = story.audio_parts || [];

  if (!audioParts.length) return;

  const queue = audioParts.map((part) => ({
    id: `${story.id}-part-${part.part_number}`,
    title: `${story.title} - ${part.title || `Part ${part.part_number}`}`,
    author: story.author || "Unknown Author",
    cover: getMediaUrl(story.cover_image),
    duration: (part.duration_estimate || 5) * 60,
    audioUrl: getMediaUrl(part.audio_url),
  }));

  setSelectedPart(index);
  usePlayerStore.getState().setQueue(queue, index);
}

  useEffect(() => {
    if (storyId) {
      loadStory(true);
    }
  }, [storyId]);

  useEffect(() => {
    if (!storyId) return;

    if (story?.audio_status !== "generating") return;

    const interval = setInterval(() => {
      loadStory(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [storyId, story?.audio_status]);

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

  if (error && !story) {
    return (
      <AppLayout rightPanel={false}>
        <div className="rounded-widget bg-white p-8 shadow-soft">
          <h1 className="text-2xl font-bold text-textMain">
            Story not found
          </h1>
          <p className="mt-2 text-textMuted">{error}</p>
        </div>
      </AppLayout>
    );
  }

  if (!story) return null;

  const coverUrl = getMediaUrl(story.cover_image);
  const bookUrl = getMediaUrl(story.book_url);

  const audioParts = story.audio_parts || [];
  const activePart = audioParts[selectedPart];

  const activeAudioUrl = activePart
    ? getMediaUrl(activePart.audio_url)
    : getMediaUrl(story.audio_url);

  return (
    <AppLayout rightPanel={false}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

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

            <div className="mt-8 rounded-[24px] bg-page p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-textMain">Audiobook Parts</h3>
                  <p className="text-sm text-textMuted">
                    Click any completed part to send it to the bottom player.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {audioParts.length > 0 && (
                    <span className="rounded-full bg-soft px-4 py-2 text-sm font-bold text-primary">
                      {audioParts.length} parts
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleGenerateAudioParts}
                    disabled={generating || story.audio_status === "generating"}
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-white disabled:opacity-60"
                  >
                    {generating || story.audio_status === "generating" ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCcw size={16} />
                        Generate Audio
                      </>
                    )}
                  </button>
                </div>
              </div>

              {story.audio_status === "generating" && (
                <div className="mb-4 flex items-center gap-3 rounded-2xl bg-blue-50 px-5 py-4 text-sm font-semibold text-blue-700">
                  <Loader2 size={18} className="animate-spin" />
                  Audio is still generating. Completed parts will appear here
                  automatically.
                </div>
              )}

              {activeAudioUrl ? (
                <audio key={activeAudioUrl} controls className="w-full">
                  <source src={activeAudioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <div className="rounded-2xl bg-yellow-50 px-5 py-4 text-sm font-semibold text-yellow-700">
                  Audio is not generated yet. Click Generate Audio.
                  {story.audio_error && (
                    <p className="mt-2 text-xs">{story.audio_error}</p>
                  )}
                </div>
              )}

              {audioParts.length > 0 && (
                <div className="mt-5 grid gap-3">
                  {audioParts.map((part, index) => (
                    <button
                      key={part.part_number}
                      type="button"
                      onClick={() => handleSelectAudioPart(index)}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                        selectedPart === index
                          ? "bg-primary text-white"
                          : "bg-white text-textMain hover:bg-soft"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-bold">
                          {part.title || `Part ${part.part_number}`}
                        </p>
                        <p
                          className={`mt-1 line-clamp-1 text-xs ${
                            selectedPart === index
                              ? "text-white/70"
                              : "text-textMuted"
                          }`}
                        >
                          {part.text_preview}
                        </p>
                      </div>

                      <span className="ml-4 shrink-0 text-sm font-bold">
                        {part.duration_estimate || 5} min
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {activeAudioUrl && (
                <button
                  type="button"
                  onClick={() => handleSelectAudioPart(selectedPart)}
                  className="inline-flex h-[52px] items-center gap-2 rounded-2xl bg-primary px-6 font-bold text-white shadow-[0_12px_28px_rgba(108,77,246,0.25)]"
                >
                  <Play size={20} />
                  Play in Bottom Player
                </button>
              )}

              {activeAudioUrl && (
                <a
                  href={activeAudioUrl}
                  target="_blank"
                  className="inline-flex h-[52px] items-center gap-2 rounded-2xl bg-soft px-6 font-bold text-primary"
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
      </div>
    </AppLayout>
  );
}