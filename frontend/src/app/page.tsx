"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    router.replace(token ? "/dashboard" : "/auth/login");
  }, [router]);
  return <main className="grid min-h-screen place-items-center bg-[#f7f5f1]"><div className="h-9 w-9 animate-spin rounded-full border-4 border-[#e7e0f5] border-t-primary" aria-label="Opening EchoTale" /></main>;
}
