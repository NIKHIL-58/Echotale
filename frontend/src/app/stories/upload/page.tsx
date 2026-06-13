"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { createStory } from "@/services/storyService";
import {
  CheckCircle2,
  FileAudio,
  FileText,
  ImageIcon,
  Loader2,
  Upload,
} from "lucide-react";

export default function UploadStoryPage() {
  const router = useRouter();

  const [bookFile, setBookFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const [showAdvanced, setShowAdvanced] = useState(false);

  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    category: "Book",
    duration: "",
    tags: "",
  });

  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!bookFile) {
      setError("Please upload a PDF story/book file.");
      return;
    }

    if (!rightsConfirmed) {
      setError("Please confirm that you have rights to upload this PDF.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("book_file", bookFile);

      if (coverFile) formData.append("cover_file", coverFile);
      if (audioFile) formData.append("audio_file", audioFile);

      formData.append("title", form.title);
      formData.append("author", form.author);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("duration", form.duration || "0");
      formData.append("tags", form.tags);

      await createStory(formData);

      router.push("/explore");
    } catch (err: any) {
      setError(err.message || "Story upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout rightPanel={false}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold text-textMain">
            Upload PDF Story
          </h1>
          <p className="mt-2 text-textMuted">
            Upload only a PDF. EchoTale will automatically detect the title,
            author, description, and cover preview when possible.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-[32px] bg-white p-8 shadow-soft"
        >
          {error && (
            <div className="rounded-2xl bg-red-50 px-5 py-4 font-semibold text-red-600">
              {error}
            </div>
          )}

          <label className="block cursor-pointer rounded-[30px] border-2 border-dashed border-primary/30 bg-soft/40 p-8 text-center transition hover:border-primary hover:bg-soft">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-primary text-white">
              <FileText size={32} />
            </div>

            <h2 className="text-2xl font-extrabold text-textMain">
              Choose PDF file
            </h2>

            <p className="mt-2 text-textMuted">
              Upload your story book as PDF. Required.
            </p>

            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setBookFile(e.target.files?.[0] || null)}
            />

            {bookFile && (
              <div className="mx-auto mt-5 flex max-w-md items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 font-bold text-primary shadow-soft">
                <CheckCircle2 size={20} />
                <span className="truncate">{bookFile.name}</span>
              </div>
            )}
          </label>

          <label className="flex items-start gap-3 rounded-2xl bg-yellow-50 p-4 text-sm text-yellow-800">
            <input
              type="checkbox"
              checked={rightsConfirmed}
              onChange={(e) => setRightsConfirmed(e.target.checked)}
              className="mt-1"
            />
            <span>
              I confirm that I own this story/book or have permission to upload
              and publish it.
            </span>
          </label>

          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="rounded-2xl bg-page px-5 py-3 font-bold text-primary hover:bg-soft"
          >
            {showAdvanced ? "Hide optional fields" : "Optional: Add audio, cover, or edit details"}
          </button>

          {showAdvanced && (
            <div className="space-y-6 rounded-[28px] bg-page p-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-bold text-textMain">
                    Title optional
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="h-12 w-full rounded-2xl border border-borderSoft px-4 outline-none focus:border-primary"
                    placeholder="Auto detected from PDF"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-textMain">
                    Author optional
                  </label>
                  <input
                    value={form.author}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, author: e.target.value }))
                    }
                    className="h-12 w-full rounded-2xl border border-borderSoft px-4 outline-none focus:border-primary"
                    placeholder="Auto detected from PDF"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block font-bold text-textMain">
                  Description optional
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="min-h-24 w-full rounded-2xl border border-borderSoft px-4 py-3 outline-none focus:border-primary"
                  placeholder="Auto generated from PDF text"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block font-bold text-textMain">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-borderSoft px-4 outline-none focus:border-primary"
                  >
                    <option>Book</option>
                    <option>Adventure</option>
                    <option>Romance</option>
                    <option>Mystery</option>
                    <option>Sci-Fi</option>
                    <option>Motivation</option>
                    <option>Fantasy</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-bold text-textMain">
                    Duration minutes
                  </label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-borderSoft px-4 outline-none focus:border-primary"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-textMain">
                    Tags
                  </label>
                  <input
                    value={form.tags}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, tags: e.target.value }))
                    }
                    className="h-12 w-full rounded-2xl border border-borderSoft px-4 outline-none focus:border-primary"
                    placeholder="fiction, mystery"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="cursor-pointer rounded-[24px] border border-dashed border-borderSoft bg-white p-5 hover:border-primary">
                  <ImageIcon className="mb-3 text-primary" />
                  <p className="font-bold text-textMain">
                    Cover image optional
                  </p>
                  <p className="mt-1 text-sm text-textMuted">
                    If empty, first PDF page becomes cover.
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  />

                  {coverFile && (
                    <p className="mt-3 truncate text-sm font-semibold text-primary">
                      {coverFile.name}
                    </p>
                  )}
                </label>

                <label className="cursor-pointer rounded-[24px] border border-dashed border-borderSoft bg-white p-5 hover:border-primary">
                  <FileAudio className="mb-3 text-primary" />
                  <p className="font-bold text-textMain">
                    Audio file optional
                  </p>
                  <p className="mt-1 text-sm text-textMuted">
                    MP3, WAV, or M4A.
                  </p>

                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  />

                  {audioFile && (
                    <p className="mt-3 truncate text-sm font-semibold text-primary">
                      {audioFile.name}
                    </p>
                  )}
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-primary font-bold text-white shadow-[0_12px_28px_rgba(108,77,246,0.25)]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Uploading PDF...
              </>
            ) : (
              <>
                <Upload size={20} />
                Upload PDF Story
              </>
            )}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}