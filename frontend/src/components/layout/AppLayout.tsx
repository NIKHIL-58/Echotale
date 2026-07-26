"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { RightPanel } from "./RightPanel";
import { BottomPlayer } from "./BottomPlayer";
import { MobileBottomNav } from "./MobileBottomNav";

export function AppLayout({ children, rightPanel = true }: { children: React.ReactNode; rightPanel?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem("access_token")) { router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`); return; }
    setReady(true);
  }, [pathname, router]);
  if (!ready) return <main className="grid min-h-screen place-items-center bg-[#f7f5f1]"><div className="h-9 w-9 animate-spin rounded-full border-4 border-[#e7e0f5] border-t-primary" /></main>;
  return <div className="min-h-screen"><Sidebar /><main className="min-h-screen px-4 pb-28 pt-4 sm:px-6 lg:ml-[272px] lg:px-8 lg:pt-6"><Suspense fallback={null}><Topbar /></Suspense><div className="mx-auto mt-7 flex max-w-[1600px] gap-7"><section className="min-w-0 flex-1">{children}</section>{rightPanel && <RightPanel />}</div></main><BottomPlayer /><MobileBottomNav /></div>;
}
