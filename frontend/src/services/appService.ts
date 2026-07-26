import type { AxiosResponse } from "axios";
import { apiClient } from "@/lib/axios";
import type { Story } from "@/services/storyService";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type StoryReference = {
  id: string;
  story_id: string;
  [key: string]: unknown;
};

export type Author = {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  cover_image: string;
  genres: string[];
  followers_count: number;
};

export type Review = {
  id: string;
  user_id: string;
  story_id: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export type Plan = {
  id: string;
  name: string;
  amount: number;
  currency: string;
};

export type Subscription = {
  id: string;
  plan: string;
  status: string;
  amount: number;
  currency: string;
  expires_at: string;
};

function unwrap<T>(response: AxiosResponse<ApiEnvelope<T>>): T {
  return response.data.data;
}

export async function getLibrary(): Promise<StoryReference[]> {
  return unwrap(await apiClient.get("/library/"));
}

export async function addToLibrary(storyId: string): Promise<StoryReference> {
  return unwrap(await apiClient.post("/library/", { story_id: storyId }));
}

export async function removeFromLibrary(storyId: string): Promise<void> {
  unwrap(await apiClient.delete("/library/" + storyId + "/"));
}

export async function getServerBookmarks(): Promise<StoryReference[]> {
  return unwrap(await apiClient.get("/bookmarks/"));
}

export async function addServerBookmark(storyId: string): Promise<StoryReference> {
  return unwrap(await apiClient.post("/bookmarks/", { story_id: storyId }));
}

export async function removeServerBookmark(bookmarkId: string): Promise<void> {
  unwrap(await apiClient.delete("/bookmarks/" + bookmarkId + "/"));
}

export async function getServerHistory(): Promise<StoryReference[]> {
  return unwrap(await apiClient.get("/history/"));
}

export async function recordHistory(storyId: string): Promise<StoryReference> {
  return unwrap(await apiClient.post("/history/", {
    story_id: storyId,
    action: "played",
  }));
}

export async function clearServerHistory(): Promise<void> {
  unwrap(await apiClient.delete("/history/"));
}

export async function getAuthors(): Promise<Author[]> {
  return unwrap(await apiClient.get("/authors/"));
}

export async function getAuthor(authorId: string): Promise<Author> {
  return unwrap(await apiClient.get("/authors/" + authorId + "/"));
}

export async function getAuthorStories(authorId: string): Promise<Story[]> {
  return unwrap(await apiClient.get("/authors/" + authorId + "/stories/"));
}

export async function getReviews(storyId: string): Promise<Review[]> {
  return unwrap(await apiClient.get("/reviews/stories/" + storyId + "/"));
}

export async function saveReview(
  storyId: string,
  rating: number,
  comment: string,
): Promise<Review> {
  return unwrap(await apiClient.post("/reviews/stories/" + storyId + "/", {
    rating,
    comment,
  }));
}

export async function deleteReview(reviewId: string): Promise<void> {
  unwrap(await apiClient.delete("/reviews/" + reviewId + "/"));
}

export async function getNotifications(unread = false): Promise<Notification[]> {
  return unwrap(await apiClient.get("/notifications/", {
    params: unread ? { unread: "true" } : undefined,
  }));
}

export async function markNotificationRead(id: string): Promise<Notification> {
  return unwrap(await apiClient.patch("/notifications/" + id + "/read/"));
}

export async function getPlans(): Promise<Plan[]> {
  return unwrap(await apiClient.get("/subscriptions/plans/"));
}

export async function getCurrentSubscription(): Promise<Subscription | null> {
  return unwrap(await apiClient.get("/subscriptions/current/"));
}

export async function choosePlan(planId: string): Promise<Subscription> {
  return unwrap(await apiClient.post("/subscriptions/subscribe/", {
    plan_id: planId,
    payment_id:
      typeof window !== "undefined" &&
      ["localhost", "127.0.0.1"].includes(window.location.hostname)
        ? "dev_local"
        : "",
  }));
}

export async function updateProfile(data: Record<string, unknown>) {
  return unwrap(await apiClient.put("/auth/profile/", data));
}

export async function requestPasswordReset(email: string) {
  return unwrap<{ reset_token?: string }>(
    await apiClient.post("/auth/forgot-password/", { email }),
  );
}

export async function resetPassword(token: string, password: string) {
  return unwrap(await apiClient.post("/auth/reset-password/", {
    token,
    password,
  }));
}

export function resolveStories(
  references: StoryReference[],
  stories: Story[],
): Story[] {
  const byId = new Map(stories.map((story) => [story.id, story]));
  return references
    .map((entry) => byId.get(entry.story_id))
    .filter((story): story is Story => Boolean(story));
}

