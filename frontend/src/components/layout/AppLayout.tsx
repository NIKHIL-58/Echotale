"use client";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { RightPanel } from "./RightPanel";
import { MobileBottomNav } from "./MobileBottomNav";
export function AppLayout({ children, rightPanel = false }: { children: React.ReactNode; rightPanel?: boolean }) {
  const router = useRouter(); const pathname = usePathname(); const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem("access_token")) { router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`); return; }
    setReady(true);
  }, [pathname, router]);
  if (!ready) return <main role="status" aria-label="Loading EchoTale" className="grid min-h-screen place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-[3px] border-soft border-t-primary" /></main>;
  return <div className="min-h-screen">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-white focus:p-3">Skip to content</a>
    <Sidebar />
    <div className="min-h-screen px-4 pb-44 pt-4 sm:px-7 lg:ml-[240px] lg:px-8 lg:pb-32 lg:pt-6 xl:px-10">
      <div className="mx-auto max-w-[1380px]"><Suspense fallback={<div className="h-14" />}><Topbar /></Suspense>
        <main id="main-content" tabIndex={-1} className="mt-7 flex gap-6 outline-none sm:mt-8"><div className="app-content min-w-0 flex-1">{children}</div>{rightPanel && <RightPanel />}</main>
      </div>
    </div>
    <MobileBottomNav />
  </div>;
}
