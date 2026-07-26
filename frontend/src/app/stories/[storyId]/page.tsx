"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";

import { usePlayerStore } from "@/store/playerStore";
import { addToHistory } from "@/lib/userLists";
import {
  addToLibrary,
  getReviews,
  recordHistory,
  saveReview,
  type Review,
} from "@/services/appService";
import { getToken } from "@/lib/auth";
import {
  getMediaUrl,
  getStory,
  regenerateAudioParts,
  Story,
} from "@/services/storyService";
import {
  BookOpen,
  FileDown,
  FileText,
  Headphones,
  Library,
  Loader2,
  MessageSquareText,
  Play,
  RefreshCcw,
  Send,
  Star,
  UserRound,
} from "lucide-react";

export default function StoryDetailPage() {
  const params = useParams();
  const storyId = params.storyId as string;

  const [story, setStory] = useState<Story | null>(null);
  const [selectedPart, setSelectedPart] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  async function loadStory(showLoader = true) {
  try {
    if (showLoader) {
      setLoading(true);
    }

    setError("");

    const data = await getStory(storyId);
    setStory(data);
    addToHistory(data);
    if (getToken()) {
      recordHistory(data.id).catch(() => undefined);
    }
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
  async function handleAddToLibrary() {
    if (!getToken()) {
      setActionMessage("Please sign in to add this story to your library.");
      return;
    }
    try {
      await addToLibrary(storyId);
      setActionMessage("Added to your library.");
    } catch {
      setActionMessage("Unable to update your library.");
    }
  }

  async function handleReview(event: React.FormEvent) {
    event.preventDefault();
    if (!getToken()) {
      setActionMessage("Please sign in to leave a review.");
      return;
    }
    try {
      await saveReview(storyId, rating, comment);
      setReviews(await getReviews(storyId));
      setComment("");
      setActionMessage("Review saved.");
      await loadStory(false);
    } catch {
      setActionMessage("Unable to save your review.");
    }
  }

  useEffect(() => {
    if (storyId) {
      loadStory(true);
    }
  }, [storyId]);
  useEffect(() => {
    if (!storyId) return;
    getReviews(storyId).then(setReviews).catch(() => setReviews([]));
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
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
            ) : (
              <div className="grid h-[420px] place-items-center bg-gradient-to-br from-[#2B1B7A] to-[#A855F7] text-white">
                <BookOpen size={64} />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">


            <h1 className="text-4xl font-extrabold text-textMain">
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
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddToLibrary}
                title="Add to library"
                aria-label="Add to library"
                className="grid h-11 w-11 place-items-center rounded-full border border-borderSoft bg-white text-textMain shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary hover:shadow-soft"
              >
                <Library size={19} />
              </button>
              {bookUrl && (
                <a
                  href={bookUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Open PDF"
                  aria-label="Open PDF"
                  className="grid h-11 w-11 place-items-center rounded-full border border-borderSoft bg-white text-textMain shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary hover:shadow-soft"
                >
                  <FileDown size={19} />
                </a>
              )}
            </div>

            <p className="mt-6 max-w-3xl leading-7 text-textMuted">
              {story.description || "No description available for this story."}
            </p>

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
            <section className="rounded-[28px] bg-page p-5 shadow-soft sm:p-7">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-textMain">Audiobook Parts</h3>
                  <p className="text-sm text-textMuted">
                    Select any completed part to start listening.
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
              {!activeAudioUrl && (
                <div className="rounded-2xl bg-yellow-50 px-5 py-4 text-sm font-semibold text-yellow-700">
                  Audio is not generated yet. Click Generate Audio.
                  {story.audio_error && (
                    <p className="mt-2 text-xs">{story.audio_error}</p>
                  )}
                </div>
              )}

              {audioParts.length > 0 && (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
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
            </section>

        <section className="overflow-hidden rounded-[30px] border border-borderSoft bg-white shadow-soft">
          <div className="flex flex-col gap-4 border-b border-borderSoft px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-soft text-primary"><MessageSquareText size={21} /></span>
              <div>
                <h2 className="text-2xl font-extrabold tracking-[-.03em]">Reader reviews</h2>
                <p className="mt-0.5 text-sm text-textMuted">Share what this story made you feel.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-page px-4 py-3">
              <span className="text-2xl font-black text-textMain">{Number(story.rating || 0).toFixed(1)}</span>
              <div>
                <div className="flex gap-0.5 text-[#e5ad32]">{[1,2,3,4,5].map((value)=><Star key={value} size={14} fill={value <= Math.round(story.rating || 0) ? "currentColor" : "none"} />)}</div>
                <p className="mt-1 text-[11px] font-semibold text-textMuted">{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
            <form onSubmit={handleReview} className="h-fit rounded-[24px] border border-borderSoft bg-page p-5 sm:p-6">
              <p className="text-sm font-bold text-textMain">Your rating</p>
              <div className="mt-3 flex items-center gap-1.5" role="radiogroup" aria-label="Story rating">
                {[1,2,3,4,5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={rating === value}
                    aria-label={`${value} star${value > 1 ? "s" : ""}`}
                    onClick={() => setRating(value)}
                    className="grid h-10 w-10 place-items-center rounded-xl transition hover:bg-white"
                  >
                    <Star size={23} className={value <= rating ? "fill-[#e5ad32] text-[#e5ad32]" : "text-[#bbb5c3]"} />
                  </button>
                ))}
                <span className="ml-2 text-sm font-bold text-textMuted">{rating}/5</span>
              </div>

              <label className="mt-5 block text-sm font-bold text-textMain" htmlFor="review-comment">Your thoughts</label>
              <div className="mt-2 overflow-hidden rounded-2xl border border-borderSoft bg-white transition focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10">
                <textarea
                  id="review-comment"
                  value={comment}
                  maxLength={500}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="What stood out to you?"
                  className="min-h-32 w-full resize-none bg-transparent p-4 text-sm leading-6 outline-none placeholder:text-[#aaa5b1]"
                />
                <div className="flex items-center justify-between border-t border-borderSoft px-4 py-2 text-xs text-textMuted">
                  <span>Be thoughtful and respectful</span>
                  <span>{comment.length}/500</span>
                </div>
              </div>

              <button type="submit" className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-[0_9px_22px_rgba(118,87,211,.22)] transition hover:-translate-y-0.5">
                <Send size={16} />
                Post review
              </button>
              {actionMessage && <p className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-primary">{actionMessage}</p>}
            </form>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-extrabold text-textMain">What readers say</h3>
                <span className="rounded-full bg-soft px-3 py-1.5 text-xs font-bold text-primary">{reviews.length} total</span>
              </div>
              <div className="space-y-3">
                {reviews.length === 0 && (
                  <div className="grid min-h-48 place-items-center rounded-[24px] border border-dashed border-borderSoft bg-page p-6 text-center">
                    <div><MessageSquareText className="mx-auto text-textMuted" size={30} /><p className="mt-3 font-bold text-textMain">No reviews yet</p><p className="mt-1 text-sm text-textMuted">Be the first reader to share a thought.</p></div>
                  </div>
                )}
                {reviews.map((review) => (
                  <article key={review.id} className="rounded-[22px] border border-borderSoft bg-white p-5 transition hover:border-primary/20 hover:shadow-soft">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-soft text-primary"><UserRound size={19} /></span>
                        <div><p className="text-sm font-bold text-textMain">EchoTale reader</p><p className="mt-0.5 text-xs text-textMuted">{review.created_at ? new Date(review.created_at).toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"}) : "Recently"}</p></div>
                      </div>
                      <div className="flex gap-0.5 text-[#e5ad32]">{[1,2,3,4,5].map((value)=><Star key={value} size={14} fill={value <= review.rating ? "currentColor" : "none"} className={value <= review.rating ? "text-[#e5ad32]" : "text-[#c8c3ce]"} />)}</div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-textMuted">{review.comment || "No written comment."}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}






