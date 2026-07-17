"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { StoryGridCard } from "@/components/stories/StoryGridCard";
import { getAuthor, getAuthorStories, type Author } from "@/services/appService";
import type { Story } from "@/services/storyService";

export default function AuthorPage() {
  const { authorId } = useParams<{ authorId: string }>();
  const [author, setAuthor] = useState<Author | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authorId) return;
    Promise.all([getAuthor(authorId), getAuthorStories(authorId)])
      .then(([authorData, storyData]) => {
        setAuthor(authorData);
        setStories(storyData);
      })
      .catch(() => setError("Author not found."));
  }, [authorId]);

  return (
    <AppLayout>
      {error && <div className="rounded-widget bg-red-50 p-6 text-red-600">{error}</div>}
      {!error && !author && <p className="text-textMuted">Loading author...</p>}
      {author && (
        <>
          <section className="rounded-widget bg-white p-6 shadow-soft">
            <div className="flex items-center gap-5">
              {author.avatar ? (
                <img src={author.avatar} alt={author.name} className="h-24 w-24 rounded-full object-cover" />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-full bg-soft text-3xl font-bold text-primary">
                  {author.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">{author.name}</h1>
                <p className="mt-2 text-textMuted">{author.bio || "EchoTale author"}</p>
                <p className="mt-2 text-sm font-semibold text-primary">{author.followers_count} followers</p>
              </div>
            </div>
          </section>
          <section className="mt-8">
            <h2 className="text-xl font-bold">Published Stories</h2>
            {stories.length === 0 ? (
              <p className="mt-4 rounded-card bg-white p-6 text-textMuted shadow-soft">No published stories from this author yet.</p>
            ) : (
              <div className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {stories.map((story) => <StoryGridCard key={story.id} story={story} />)}
              </div>
            )}
          </section>
        </>
      )}
    </AppLayout>
  );
}
