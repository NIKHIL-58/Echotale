"use client";
import { useParams } from "next/navigation";
import { StoryCollection } from "@/components/stories/StoryCollection";
export default function Page() { const { category } = useParams<{ category: string }>(); return <StoryCollection kind="category" category={category || ""} />; }
