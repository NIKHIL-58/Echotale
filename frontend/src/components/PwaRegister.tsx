"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Wifi, WifiOff, X } from "lucide-react";
import { syncPendingProgress } from "@/services/playbackService";
import { syncOfflineLibrary } from "@/services/offlineService";

export function PwaRegister() {
  const [online, setOnline] = useState(true);
  const [showRestored, setShowRestored] = useState(false);
  const [updateReady, setUpdateReady] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    setOnline(navigator.onLine);
    const handleOffline = () => { setOnline(false); setShowRestored(false); };
    const handleOnline = () => { Promise.allSettled([syncPendingProgress(), syncOfflineLibrary()]); setOnline(true); setShowRestored(true); window.setTimeout(() => setShowRestored(false), 3500); };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((registration) => {
        registration.update();
        if (registration.waiting) setUpdateReady(registration.waiting);
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          worker?.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) setUpdateReady(worker);
          });
        });
      }).catch((error) => console.error("Service worker registration failed:", error));
    }

    return () => { window.removeEventListener("offline", handleOffline); window.removeEventListener("online", handleOnline); };
  }, []);

  function applyUpdate() {
    updateReady?.postMessage({ type: "SKIP_WAITING" });
    window.location.reload();
  }

  if (!online) return <div role="status" className="fixed left-1/2 top-4 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-full border border-[#e4bf70]/30 bg-[#17112f] px-5 py-3 text-sm font-bold text-white shadow-2xl"><WifiOff className="h-4 w-4 text-[#e4bf70]"/><span>You’re offline · cached content is available</span></div>;
  if (updateReady) return <button onClick={applyUpdate} className="fixed bottom-24 right-5 z-[100] flex items-center gap-2 rounded-2xl bg-[#17112f] px-5 py-3 text-sm font-bold text-white shadow-2xl"><RefreshCw className="h-4 w-4 text-[#e4bf70]"/>Update EchoTale</button>;
  if (showRestored) return <div role="status" className="fixed left-1/2 top-4 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-2xl"><Wifi className="h-4 w-4"/>Back online<button aria-label="Dismiss" onClick={()=>setShowRestored(false)}><X className="h-4 w-4"/></button></div>;
  return null;
}



