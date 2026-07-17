"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SearchInput } from "@/components/ui/SearchInput";
import { StoryGridCard } from "@/components/stories/StoryGridCard";
import { getStories, type Story } from "@/services/storyService";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("search") || params.get("q") || "";
    setQuery(initialQuery);
    setActiveQuery(initialQuery);
    getStories().then(setStories).catch(() => setStories([]));
  }, []);

  const results = useMemo(() => {
    const normalized = activeQuery.trim().toLowerCase();
    if (!normalized) return [];
    return stories.filter((story) =>
      [story.title, story.author, story.category, story.description]
        .some((value) => value?.toLowerCase().includes(normalized)),
    );
  }, [stories, activeQuery]);

  function submit(event: FormEvent) {
    event.preventDefault();
    setActiveQuery(query);
  }

  return (
    <AppLayout>
      <h1 className="text-3xl font-bold">Search</h1>
      <form onSubmit={submit} className="mt-5 rounded-widget bg-white p-5 shadow-soft">
        <SearchInput value={query} onChange={(event) => setQuery(event.target.value)} />
      </form>
      {!activeQuery ? (
        <p className="mt-6 rounded-widget bg-white p-6 text-textMuted shadow-soft">
          Enter a title, author, category, or keyword.
        </p>
      ) : results.length === 0 ? (
        <p className="mt-6 rounded-widget bg-white p-6 text-textMuted shadow-soft">
          No results found for ?{activeQuery}?.
        </p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((story) => <StoryGridCard key={story.id} story={story} />)}
        </div>
      )}
    </AppLayout>
  );
}
