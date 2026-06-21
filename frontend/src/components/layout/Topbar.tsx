"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  BookOpen,
  ChevronDown,
  Clock3,
  LogOut,
  Search,
  User,
} from "lucide-react";
import { getStoredUser, getToken, logoutUser } from "@/lib/auth";
import { getMediaUrl } from "@/services/storyService";
import { API_URL } from "@/lib/api";
import { getHistory } from "@/lib/userLists";

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

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: "bell" | "book" | "clock";
};

export function Topbar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

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

  useEffect(() => {
    function loadNotifications() {
      const history = getHistory();

      const items: NotificationItem[] = [
        {
          id: "welcome",
          title: "Welcome to EchoTale",
          message: "Upload PDFs and listen to AI-generated audiobooks.",
          time: "Now",
          icon: "bell",
        },
      ];

      if (history.length > 0) {
        items.unshift({
          id: "history",
          title: "Continue listening",
          message: `You recently opened ${history[0].title}.`,
          time: "Recent",
          icon: "clock",
        });
      }

      setNotifications(items);
    }

    loadNotifications();

    const interval = setInterval(loadNotifications, 5000);

    return () => clearInterval(interval);
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

  function renderNotificationIcon(type: NotificationItem["icon"]) {
    if (type === "book") return <BookOpen size={18} />;
    if (type === "clock") return <Clock3 size={18} />;
    return <Bell size={18} />;
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
          onClick={() => {
            setNotificationOpen((prev) => !prev);
            setMenuOpen(false);
          }}
          className="relative grid h-11 w-11 place-items-center rounded-full bg-white text-[#10142D] shadow-sm hover:bg-[#EEE9FF]"
        >
          <Bell size={22} />

          {notifications.length > 0 && (
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </button>

        {notificationOpen && (
          <div className="absolute right-24 top-16 z-50 w-80 rounded-3xl border border-[#EAECF0] bg-white p-3 shadow-[0_18px_50px_rgba(16,20,45,0.15)]">
            <div className="border-b border-[#EAECF0] px-3 py-3">
              <p className="font-bold text-[#10142D]">Notifications</p>
              <p className="mt-1 text-sm text-[#667085]">
                Latest updates from EchoTale
              </p>
            </div>

            {notifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-[#667085]">
                No notifications yet.
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-2xl px-3 py-3 hover:bg-[#EEE9FF]"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#EEE9FF] text-[#6C4DF6]">
                      {renderNotificationIcon(item.icon)}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#10142D]">
                        {item.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-[#667085]">
                        {item.message}
                      </p>
                      <p className="mt-1 text-[11px] font-semibold text-[#6C4DF6]">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setMenuOpen((prev) => !prev);
            setNotificationOpen(false);
          }}
          className="flex items-center gap-3 rounded-2xl px-2 py-2 hover:bg-white"
        >
          <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-[#EEE9FF] text-[#6C4DF6]">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
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