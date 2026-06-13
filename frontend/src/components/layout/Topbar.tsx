"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bell, ChevronDown, LogOut, Search, User } from "lucide-react";
import { getStoredUser, getToken, logoutUser } from "@/lib/auth";
import { getMediaUrl } from "@/services/storyService";
import { API_URL } from "@/lib/api";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  is_premium?: boolean;
  favorite_genres?: string[];
  language?: string;
  listening_goal?: number;
};

export function Topbar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get("search") || "");

  useEffect(() => {
    setQuery(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const storedUser = getStoredUser();

    if (storedUser) {
      setUser(storedUser);
    }

    async function fetchProfile() {
      const token = getToken();

      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/auth/me/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setUser(data.data);
          localStorage.setItem("user", JSON.stringify(data.data));
        }
      } catch {
        console.log("Profile fetch failed");
      }
    }

    fetchProfile();
  }, []);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanQuery = query.trim();

    if (!cleanQuery) {
      router.push("/explore");
      return;
    }

    router.push(`/explore?search=${encodeURIComponent(cleanQuery)}`);
  }

  const displayName = user?.name || "User";
  const firstName = displayName.split(" ")[0];
  const avatarUrl = user?.avatar ? getMediaUrl(user.avatar) : "";

  return (
    <header className="flex items-center justify-between gap-6">
      <form
        onSubmit={handleSearchSubmit}
        className="flex h-16 w-full max-w-[560px] items-center gap-4 rounded-2xl border border-[#EAECF0] bg-white px-5 shadow-sm"
      >
        <Search className="text-[#667085]" size={24} />

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search stories, authors, podcasts..."
          className="w-full bg-transparent text-base outline-none placeholder:text-[#98A2B3]"
        />
      </form>

      <div className="relative flex items-center gap-5">
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#10142D] shadow-sm hover:bg-[#EEE9FF]"
        >
          <Bell size={22} />
        </button>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center gap-3 rounded-2xl px-2 py-2 hover:bg-white"
        >
          <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-[#EEE9FF] text-[#6C4DF6]">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <User size={24} />
            )}
          </div>

          <div className="hidden text-left md:block">
            <p className="text-base font-bold text-[#10142D]">
              Hi, {firstName}
            </p>
            <p className="text-xs text-[#667085]">{user?.email}</p>
          </div>

          <ChevronDown size={18} className="text-[#667085]" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-16 z-50 w-64 rounded-3xl border border-[#EAECF0] bg-white p-3 shadow-[0_18px_50px_rgba(16,20,45,0.15)]">
            <div className="border-b border-[#EAECF0] px-3 py-3">
              <p className="font-bold text-[#10142D]">{displayName}</p>
              <p className="mt-1 text-sm text-[#667085]">{user?.email}</p>
            </div>

            <a
              href="/profile"
              className="mt-2 flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-[#10142D] hover:bg-[#EEE9FF]"
            >
              <User size={18} />
              Profile
            </a>

            <button
              type="button"
              onClick={logoutUser}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}