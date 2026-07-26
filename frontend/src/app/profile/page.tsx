"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Camera,
  CalendarDays,
  CheckCircle2,
  Crown,
  Edit3,
  Globe2,
  Heart,
  Loader2,
  LogOut,
  Mail,
  Save,
  Sparkles,
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

        <section className="relative isolate overflow-hidden rounded-[30px] bg-[#0d0a22] p-6 text-white shadow-[0_24px_60px_rgba(24,17,51,.22)] sm:p-8">
          <img src="/premium-story-world.png" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-right opacity-25" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0d0a22] via-[#0d0a22]/95 to-[#0d0a22]/65" />
          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-[26px] border-2 border-white/15 bg-white/10 text-[#e6be6d] shadow-2xl sm:h-28 sm:w-28">
                  {user.avatar ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" /> : <User size={42} />}
                </div>
                <button onClick={() => setEditOpen(true)} aria-label="Change profile picture" title="Change profile picture" className="absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-xl border-2 border-[#0d0a22] bg-[#e4ba65] text-[#241807] shadow-lg transition hover:scale-105"><Camera size={16} /></button>
              </div>

              <div className="min-w-0">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.08] px-3 py-1.5 text-xs font-bold text-[#edcf91] backdrop-blur">
                  {user.is_premium ? <><Crown size={14} /> Premium member</> : <><Sparkles size={14} /> EchoTale listener</>}
                </div>
                <h1 className="truncate text-3xl font-black tracking-[-.04em] sm:text-4xl">{user.name}</h1>
                <p className="mt-2 flex items-center gap-2 text-sm text-white/55"><Mail size={15} />{user.email}</p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-white/55">
                  <span className="flex items-center gap-2"><Globe2 size={14} className="text-[#e4ba65]" />{user.language || "English"}</span>
                  <span className="flex items-center gap-2"><Target size={14} className="text-[#e4ba65]" />{user.listening_goal || 30} min daily</span>
                  {user.created_at && <span className="flex items-center gap-2"><CalendarDays size={14} className="text-[#e4ba65]" />Joined {new Date(user.created_at).getFullYear()}</span>}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <button onClick={() => setEditOpen(true)} aria-label="Edit profile" title="Edit profile" className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[#241b45] shadow-xl transition hover:-translate-y-0.5 hover:bg-[#fff8e8]"><Edit3 size={18} /></button>
              <button onClick={logout} aria-label="Log out" title="Log out" className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/[.08] text-white/70 transition hover:border-red-300/30 hover:bg-red-500/15 hover:text-red-200"><LogOut size={18} /></button>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
          <article className="rounded-[26px] border border-borderSoft bg-white p-6 shadow-soft sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fdebf3] text-[#d93d7d]"><Heart size={21} /></span><div><p className="text-xs font-bold uppercase tracking-[.14em] text-textMuted">Your taste</p><h2 className="mt-1 text-xl font-extrabold tracking-[-.02em]">Favorite genres</h2></div></div>
              <button onClick={() => setEditOpen(true)} className="rounded-full bg-page px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-soft">Manage</button>
            </div>
            {user.favorite_genres?.length ? <div className="mt-6 flex flex-wrap gap-2">{user.favorite_genres.map((genre)=><span key={genre} className="rounded-full border border-primary/10 bg-soft px-4 py-2 text-sm font-bold text-primary">{genre}</span>)}</div> : <div className="mt-6 rounded-2xl border border-dashed border-borderSoft bg-page p-5 text-sm text-textMuted">Choose genres to improve your recommendations.</div>}
          </article>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <article className="flex items-center gap-4 rounded-[24px] border border-borderSoft bg-white p-5 shadow-soft">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#e9f1ff] text-[#356fd0]"><Globe2 size={22} /></span>
              <div><p className="text-xs font-bold uppercase tracking-[.12em] text-textMuted">Language</p><p className="mt-1 font-extrabold text-textMain">{user.language || "English"}</p><p className="mt-1 text-xs text-textMuted">Preferred narration</p></div>
            </article>
            <article className="flex items-center gap-4 rounded-[24px] border border-borderSoft bg-white p-5 shadow-soft">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#fff0dd] text-[#db742b]"><Target size={22} /></span>
              <div><p className="text-xs font-bold uppercase tracking-[.12em] text-textMuted">Daily goal</p><p className="mt-1 font-extrabold text-textMain">{user.listening_goal || 30} minutes</p><p className="mt-1 text-xs text-textMuted">Keep your listening streak</p></div>
            </article>
          </div>
        </section>      </div>

      {editOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#080615]/70 p-3 backdrop-blur-md sm:p-6">
          <form onSubmit={updateProfile} className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_30px_100px_rgba(8,5,25,.45)]">
            <header className="flex shrink-0 items-center justify-between bg-[#0d0a22] px-5 py-5 text-white sm:px-7">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-[#e5bd6b]"><Edit3 size={18} /></span>
                <div><h2 className="text-xl font-extrabold tracking-[-.02em]">Edit profile</h2><p className="mt-0.5 text-xs text-white/50">Personalize your EchoTale experience</p></div>
              </div>
              <button type="button" onClick={() => setEditOpen(false)} aria-label="Close edit profile" className="grid h-9 w-9 place-items-center rounded-xl bg-white/[.08] text-white/65 transition hover:bg-white/15 hover:text-white"><X size={18} /></button>
            </header>

            <div className="flex-1 overflow-y-auto p-5 sm:p-7">
              <section>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div><h3 className="font-extrabold text-textMain">Profile details</h3><p className="mt-1 text-xs text-textMuted">Choose your display name and avatar.</p></div>
                  <button type="button" onClick={() => setShowCustomAvatar((prev) => !prev)} className="shrink-0 rounded-xl border border-borderSoft bg-page px-3 py-2 text-xs font-bold text-primary transition hover:bg-soft">{showCustomAvatar ? "Hide URL" : "Use image URL"}</button>
                </div>

                <div className="grid gap-5 rounded-[22px] border border-borderSoft bg-page p-4 sm:grid-cols-[1fr_1.45fr] sm:p-5">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[.1em] text-textMuted">Full name</label>
                    <input value={form.name} onChange={(e)=>setForm((prev)=>({...prev,name:e.target.value}))} className="h-11 w-full rounded-xl border border-borderSoft bg-white px-4 text-sm outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10" />
                    {showCustomAvatar && <div className="mt-4"><label className="mb-2 block text-xs font-bold uppercase tracking-[.1em] text-textMuted">Avatar URL</label><input value={form.avatar} onChange={(e)=>setForm((prev)=>({...prev,avatar:e.target.value}))} placeholder="https://..." className="h-11 w-full rounded-xl border border-borderSoft bg-white px-4 text-sm outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10" /></div>}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[.1em] text-textMuted">Choose avatar</label>
                    <div className="grid grid-cols-6 gap-2.5">
                      {avatarOptions.map((avatar,index)=>{const selected=form.avatar===avatar.url;return <button key={avatar.url} type="button" onClick={()=>setForm((prev)=>({...prev,avatar:avatar.url}))} aria-label={`Select avatar ${index+1}`} className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-white p-1 transition hover:-translate-y-0.5 ${selected?"border-primary shadow-[0_7px_18px_rgba(118,87,211,.2)]":"border-transparent hover:border-primary/20"}`}><img src={avatar.url} alt="" className="h-full w-full rounded-lg object-cover" />{selected&&<span className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-white ring-2 ring-white"><CheckCircle2 size={12} /></span>}</button>})}
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-7">
                <div className="mb-4"><h3 className="font-extrabold text-textMain">Listening preferences</h3><p className="mt-1 text-xs text-textMuted">Used to personalize stories and recommendations.</p></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="rounded-[20px] border border-borderSoft bg-white p-4"><span className="mb-3 flex items-center gap-2 text-sm font-bold text-textMain"><Globe2 size={17} className="text-primary" />Language</span><select value={form.language} onChange={(e)=>setForm((prev)=>({...prev,language:e.target.value}))} className="h-11 w-full rounded-xl border border-borderSoft bg-page px-3 text-sm outline-none focus:border-primary"><option>English</option><option>Hindi</option><option>Spanish</option><option>French</option></select></label>
                  <label className="rounded-[20px] border border-borderSoft bg-white p-4"><span className="mb-3 flex items-center gap-2 text-sm font-bold text-textMain"><Target size={17} className="text-primary" />Daily listening goal</span><div className="relative"><input type="number" min={5} max={240} value={form.listening_goal} onChange={(e)=>setForm((prev)=>({...prev,listening_goal:Number(e.target.value)}))} className="h-11 w-full rounded-xl border border-borderSoft bg-page px-3 pr-20 text-sm outline-none focus:border-primary" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-textMuted">minutes</span></div></label>
                </div>
              </section>

              <section className="mt-7">
                <h3 className="font-extrabold text-textMain">Favorite genres</h3><p className="mt-1 text-xs text-textMuted">Select all that match your taste.</p>
                <div className="mt-4 flex flex-wrap gap-2">{genreOptions.map((genre)=>{const active=form.favorite_genres.includes(genre);return <button key={genre} type="button" onClick={()=>toggleGenre(genre)} className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-bold transition ${active?"border-primary bg-soft text-primary":"border-borderSoft bg-white text-textMuted hover:border-primary/25 hover:text-textMain"}`}>{active&&<CheckCircle2 size={14} />}{genre}</button>})}</div>
              </section>
            </div>

            <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-borderSoft bg-white px-5 py-4 sm:px-7">
              <button type="button" onClick={() => setEditOpen(false)} className="h-10 rounded-xl px-4 text-sm font-bold text-textMuted transition hover:bg-page hover:text-textMain">Cancel</button>
              <button type="submit" disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(118,87,211,.2)] disabled:opacity-60">{saving?<><Loader2 className="animate-spin" size={16} />Saving...</>:<><Save size={16} />Save changes</>}</button>
            </footer>
          </form>
        </div>
      )}
    </AppLayout>
  );
}

