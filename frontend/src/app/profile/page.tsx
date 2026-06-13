"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Camera,
  CheckCircle2,
  Crown,
  Edit3,
  Globe2,
  Heart,
  Loader2,
  Save,
  Target,
  User,
  X,
} from "lucide-react";
import { API_URL } from "@/lib/api";

type ProfileUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  is_premium?: boolean;
  favorite_genres?: string[];
  language?: string;
  listening_goal?: number;
  created_at?: string;
};

const genreOptions = [
  "Adventure",
  "Romance",
  "Mystery",
  "Sci-Fi",
  "Motivation",
  "Fantasy",
];

const avatarOptions = [
  {
    url: "https://api.dicebear.com/9.x/shapes/svg?seed=echo-purple&backgroundColor=6C4DF6,A855F7,EEE9FF",
  },
  {
    url: "https://api.dicebear.com/9.x/shapes/svg?seed=echo-night&backgroundColor=120A3D,2B1B7A,8B5CF6",
  },
  {
    url: "https://api.dicebear.com/9.x/shapes/svg?seed=echo-sunset&backgroundColor=F97316,FBBF24,FDE68A",
  },
  {
    url: "https://api.dicebear.com/9.x/shapes/svg?seed=echo-ocean&backgroundColor=0EA5E9,38BDF8,DBEAFE",
  },
  {
    url: "https://api.dicebear.com/9.x/shapes/svg?seed=echo-forest&backgroundColor=22C55E,86EFAC,DCFCE7",
  },
  {
    url: "https://api.dicebear.com/9.x/shapes/svg?seed=echo-rose&backgroundColor=EC4899,F9A8D4,FCE7F3",
  },
  {
    url: "https://api.dicebear.com/9.x/glass/svg?seed=story-one",
  },
  {
    url: "https://api.dicebear.com/9.x/glass/svg?seed=story-two",
  },
  {
    url: "https://api.dicebear.com/9.x/glass/svg?seed=story-three",
  },
  {
    url: "https://api.dicebear.com/9.x/glass/svg?seed=story-four",
  },
  {
    url: "https://api.dicebear.com/9.x/identicon/svg?seed=audio-one&backgroundColor=EEE9FF",
  },
  {
    url: "https://api.dicebear.com/9.x/identicon/svg?seed=audio-two&backgroundColor=F7F8FC",
  },
];

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showCustomAvatar, setShowCustomAvatar] = useState(false);

  const [form, setForm] = useState({
    name: "",
    avatar: "",
    language: "English",
    listening_goal: 30,
    favorite_genres: [] as string[],
  });

  function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  async function fetchProfile() {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        window.location.href = "/auth/login";
        return;
      }

      const res = await fetch(`${API_URL}/auth/profile/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Unable to load profile.");
        return;
      }

      const profile = data.data;

      setUser(profile);
      localStorage.setItem("user", JSON.stringify(profile));

      setForm({
        name: profile.name || "",
        avatar: profile.avatar || "",
        language: profile.language || "English",
        listening_goal: profile.listening_goal || 30,
        favorite_genres: profile.favorite_genres || [],
      });
    } catch {
      setError("Backend not connected. Please check Django server.");
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const token = getToken();

      if (!token) {
        window.location.href = "/auth/login";
        return;
      }

      const res = await fetch(`${API_URL}/auth/profile/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Profile update failed.");
        return;
      }

      setUser(data.data);
      localStorage.setItem("user", JSON.stringify(data.data));

      setMessage("Profile updated successfully.");
      setEditOpen(false);
    } catch {
      setError("Backend not connected. Please check Django server.");
    } finally {
      setSaving(false);
    }
  }

  function toggleGenre(genre: string) {
    setForm((prev) => {
      const exists = prev.favorite_genres.includes(genre);

      return {
        ...prev,
        favorite_genres: exists
          ? prev.favorite_genres.filter((item) => item !== genre)
          : [...prev.favorite_genres, genre],
      };
    });
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/auth/login";
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <AppLayout rightPanel={false}>
        <div className="grid min-h-[60vh] place-items-center">
          <div className="flex items-center gap-3 rounded-3xl bg-white px-6 py-5 shadow-soft">
            <Loader2 className="animate-spin text-primary" />
            <span className="font-semibold text-textMain">
              Loading profile...
            </span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout rightPanel={false}>
        <div className="rounded-widget bg-white p-8 shadow-soft">
          <h1 className="text-2xl font-bold text-textMain">
            Profile not found
          </h1>

          <p className="mt-2 text-textMuted">{error}</p>

          <button
            onClick={() => (window.location.href = "/auth/login")}
            className="mt-5 rounded-2xl bg-primary px-6 py-3 font-bold text-white"
          >
            Go to login
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout rightPanel={false}>
      <div className="space-y-6">
        {message && (
          <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <section className="relative overflow-hidden rounded-[32px] bg-white p-8 shadow-soft">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-soft blur-3xl" />

          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="relative">
                <div className="grid h-32 w-32 place-items-center overflow-hidden rounded-full bg-soft text-primary shadow-soft">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={52} />
                  )}
                </div>

                <button
                  onClick={() => setEditOpen(true)}
                  className="absolute bottom-1 right-1 grid h-10 w-10 place-items-center rounded-full bg-primary text-white shadow-card"
                >
                  <Camera size={18} />
                </button>
              </div>

              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-soft px-4 py-2 text-sm font-bold text-primary">
                  {user.is_premium ? (
                    <>
                      <Crown size={16} />
                      Premium Member
                    </>
                  ) : (
                    <>
                      <User size={16} />
                      Free Listener
                    </>
                  )}
                </div>

                <h1 className="text-4xl font-extrabold text-textMain">
                  {user.name}
                </h1>

                <p className="mt-2 text-textMuted">{user.email}</p>

                <div className="mt-4 flex flex-wrap gap-3 text-sm text-textMuted">
                  <span className="rounded-full bg-page px-4 py-2">
                    {user.language || "English"}
                  </span>

                  <span className="rounded-full bg-page px-4 py-2">
                    Goal: {user.listening_goal || 30} min/day
                  </span>

                  <span className="rounded-full bg-page px-4 py-2">
                    Role: {user.role || "user"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setEditOpen(true)}
                className="inline-flex h-[52px] items-center gap-2 rounded-2xl bg-primary px-6 py-4 font-bold text-white shadow-[0_12px_28px_rgba(108,77,246,0.25)]"
              >
                <Edit3 size={18} />
                Edit Profile
              </button>

              <button
                onClick={logout}
                className="h-[52px] rounded-2xl border border-red-100 bg-red-50 px-6 py-4 font-bold text-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <div className="rounded-widget bg-white p-6 shadow-soft">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-pink-100 text-pink-600">
              <Heart size={24} />
            </div>

            <h3 className="text-xl font-bold text-textMain">
              Favorite Genres
            </h3>

            <p className="mt-2 text-textMuted">
              {user.favorite_genres?.length
                ? user.favorite_genres.join(", ")
                : "No favorite genres selected yet."}
            </p>
          </div>

          <div className="rounded-widget bg-white p-6 shadow-soft">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-blue-100 text-blue-600">
              <Globe2 size={24} />
            </div>

            <h3 className="text-xl font-bold text-textMain">Language</h3>

            <p className="mt-2 text-textMuted">
              Listening language: {user.language || "English"}
            </p>
          </div>

          <div className="rounded-widget bg-white p-6 shadow-soft">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 text-orange-600">
              <Target size={24} />
            </div>

            <h3 className="text-xl font-bold text-textMain">
              Listening Goal
            </h3>

            <p className="mt-2 text-textMuted">
              {user.listening_goal || 30} minutes per day
            </p>
          </div>
        </section>
      </div>

      {editOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
          <form
            onSubmit={updateProfile}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-[0_24px_80px_rgba(16,20,45,0.25)]"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-textMain">
                  Edit Profile
                </h2>

                <p className="mt-1 text-sm text-textMuted">
                  Update your personal listening details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full bg-page text-textMuted"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-textMain">
                  Full name
                </label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-borderSoft px-4 outline-none focus:border-primary"
                />
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <label className="block text-sm font-bold text-textMain">
                      Profile avatar
                    </label>

                    <p className="mt-1 text-xs text-textMuted">
                      Pick a visual identity for your EchoTale profile.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCustomAvatar((prev) => !prev)}
                    className="shrink-0 rounded-full bg-soft px-4 py-2 text-xs font-bold text-primary transition hover:bg-primary hover:text-white"
                  >
                    {showCustomAvatar ? "Hide URL" : "Use URL"}
                  </button>
                </div>

                <div className="rounded-[28px] border border-borderSoft bg-page p-4">
                  <div className="grid grid-cols-4 gap-4 sm:grid-cols-6">
                    {avatarOptions.map((avatar, index) => {
                      const selected = form.avatar === avatar.url;

                      return (
                        <button
                          key={avatar.url}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              avatar: avatar.url,
                            }))
                          }
                          className={`group relative rounded-[24px] p-2 transition ${
                            selected
                              ? "bg-white shadow-[0_14px_34px_rgba(108,77,246,0.28)] ring-2 ring-primary"
                              : "hover:bg-white hover:shadow-soft"
                          }`}
                          aria-label={`Select avatar ${index + 1}`}
                        >
                          <img
                            src={avatar.url}
                            alt={`Avatar ${index + 1}`}
                            className="h-20 w-full rounded-[20px] object-cover"
                          />

                          {selected && (
                            <span className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-primary text-sm font-bold text-white ring-2 ring-white">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {showCustomAvatar && (
                  <div className="mt-5 rounded-3xl border border-borderSoft bg-page p-4">
                    <label className="mb-2 block text-sm font-bold text-textMain">
                      Custom avatar URL
                    </label>

                    <input
                      value={form.avatar}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          avatar: e.target.value,
                        }))
                      }
                      placeholder="Paste image URL here"
                      className="h-12 w-full rounded-2xl border border-borderSoft bg-white px-4 text-sm outline-none focus:border-primary"
                    />

                    <p className="mt-2 text-xs text-textMuted">
                      Use a direct image URL ending in .jpg, .png, .webp, or
                      .svg.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-textMain">
                    Language
                  </label>

                  <select
                    value={form.language}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        language: e.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-borderSoft px-4 outline-none focus:border-primary"
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-textMain">
                    Daily goal
                  </label>

                  <input
                    type="number"
                    min={5}
                    max={240}
                    value={form.listening_goal}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        listening_goal: Number(e.target.value),
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-borderSoft px-4 outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold text-textMain">
                  Favorite genres
                </label>

                <div className="flex flex-wrap gap-2">
                  {genreOptions.map((genre) => {
                    const active = form.favorite_genres.includes(genre);

                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                          active
                            ? "bg-primary text-white"
                            : "bg-page text-textMuted hover:bg-soft hover:text-primary"
                        }`}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-7 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-bold text-white shadow-[0_12px_28px_rgba(108,77,246,0.25)]"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Profile
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </AppLayout>
  );
}