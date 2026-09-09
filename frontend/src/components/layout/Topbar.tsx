"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { getStoredUser, getToken, logoutUser } from "@/lib/auth";
import { getMediaUrl } from "@/services/storyService";
import { API_URL } from "@/lib/api";
import { getNotifications } from "@/services/appService";
import { HeaderBookSearch } from "@/components/search/HeaderBookSearch";
import { EchoTaleLogo } from "@/components/brand/EchoTaleLogo";
type AuthUser = { id: string; name: string; email: string; avatar?: string };
export function Topbar() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setUser(getStoredUser());
    const controller = new AbortController();
    const token = getToken();
    if (token) {
      fetch(`${API_URL}/auth/me/`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal }).then(r => r.json()).then(data => { if (data.success) setUser(data.data); }).catch(() => undefined);
      getNotifications(true).then(items => setUnread(items.length)).catch(() => undefined);
    }
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const outside = (e: PointerEvent) => { if (menu.current && !menu.current.contains(e.target as Node)) setMenuOpen(false); };
    const escape = (e: KeyboardEvent) => { if (e.key === "Escape" && menuOpen) { setMenuOpen(false); trigger.current?.focus(); } };
    document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [menuOpen]);
  const name = user?.name || "Your account";
  const avatar = user?.avatar ? getMediaUrl(user.avatar) : "";
  return <header className="flex flex-wrap items-center gap-3 border-b border-borderSoft pb-5 lg:flex-nowrap">
    <Link href="/dashboard" aria-label="EchoTale home" className="mr-auto lg:hidden"><EchoTaleLogo /></Link>
    <div className="order-3 w-full min-w-0 lg:order-none lg:flex-1"><HeaderBookSearch /></div>
    <Link href="/notifications" className="icon-button relative" aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}><Bell size={19}/>{unread > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />}</Link>
    <div ref={menu} className="relative shrink-0">
      <button ref={trigger} type="button" aria-label="Open account menu" aria-expanded={menuOpen} aria-controls="account-menu" onClick={() => setMenuOpen(!menuOpen)} className="flex min-h-11 items-center gap-2.5 rounded-xl px-1.5 transition hover:bg-white">
        <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-soft text-sm font-bold text-primary">{avatar && !avatarFailed ? <img src={avatar} alt="" className="h-full w-full object-cover" onError={() => setAvatarFailed(true)} /> : name.charAt(0).toUpperCase()}</span>
        <span className="hidden max-w-36 truncate text-sm font-semibold xl:block">{name.split(" ")[0]}</span><ChevronDown size={15} className="text-textMuted" />
      </button>
      {menuOpen && <div id="account-menu" className="absolute right-0 top-14 z-[90] w-64 rounded-2xl border border-borderSoft bg-white p-2 shadow-card"><div className="mb-1 border-b border-borderSoft p-3"><p className="truncate text-sm font-semibold">{name}</p><p className="truncate text-xs text-textMuted">{user?.email}</p></div>
        <Link href="/profile" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm hover:bg-soft"><User size={16}/>My profile</Link>
        <Link href="/settings" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm hover:bg-soft"><Settings size={16}/>Settings</Link>
        <button type="button" onClick={logoutUser} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-red-700 hover:bg-red-50"><LogOut size={16}/>Sign out</button>
      </div>}
    </div>
  </header>;
}



