"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { getAuthors, type Author } from "@/services/appService";

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getAuthors().then(setAuthors).catch(() => setError("Unable to load authors."));
  }, []);

  return (
    <AppLayout>
      <h1 className="text-3xl font-bold">Authors</h1>
      <p className="mt-2 text-textMuted">Discover storytellers and their published work.</p>
      {error && <p className="mt-6 rounded-card bg-red-50 p-4 text-red-600">{error}</p>}
      {!error && authors.length === 0 && (
        <p className="mt-6 rounded-card bg-white p-6 text-textMuted shadow-soft">
          No author profiles are available yet.
        </p>
      )}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {authors.map((author) => (
          <Link
            key={author.id}
            href={`/authors/${author.id}`}
            className="rounded-widget bg-white p-6 shadow-soft transition hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              {author.avatar ? (
                <img src={author.avatar} alt={author.name} className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="grid h-16 w-16 place-items-center rounded-full bg-soft text-xl font-bold text-primary">
                  {author.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold">{author.name}</h2>
                <p className="text-sm text-textMuted">{author.followers_count} followers</p>
              </div>
            </div>
            <p className="mt-4 line-clamp-3 text-sm text-textMuted">
              {author.bio || "Author profile"}
            </p>
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}
