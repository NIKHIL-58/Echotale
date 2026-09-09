"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { StoryCollection } from "@/components/stories/StoryCollection";
function Explore() { const params = useSearchParams(); const type = params.get("type"); return <StoryCollection kind={type === "audiobooks" ? "audiobooks" : type === "podcasts" ? "podcasts" : "explore"} initialQuery={params.get("search") || ""} />; }
export default function Page() { return <Suspense><Explore /></Suspense>; }
