import { Suspense } from "react";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { RightPanel } from "./RightPanel";
import { BottomPlayer } from "./BottomPlayer";
import { MobileBottomNav } from "./MobileBottomNav";

export function AppLayout({
  children,
  rightPanel = true,
}: {
  children: React.ReactNode;
  rightPanel?: boolean;
}) {
  return (
    <div className="min-h-screen">
      <Sidebar />

      <main className="min-h-screen px-4 pb-28 pt-4 sm:px-6 lg:ml-[272px] lg:px-8 lg:pt-6">
        <Suspense fallback={null}>
          <Topbar />
        </Suspense>

        <div className="mx-auto mt-7 flex max-w-[1600px] gap-7">
          <section className="min-w-0 flex-1">{children}</section>
          {rightPanel && <RightPanel />}
        </div>
      </main>

      <BottomPlayer />
      <MobileBottomNav />
    </div>
  );
}
