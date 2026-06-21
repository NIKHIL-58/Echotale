const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

const API_URL = `${API_BASE}/api`;

export type AudioPart = {
  part_number: number;
  title: string;
  audio_url: string;
  text_preview: string;
  duration_estimate: number;
  created_at?: string;
};

export type Story = {
  id: string;
  title: string;
  slug: string;
  author: string;
  description: string;
  category: string;
  tags: string[];
  cover_image: string;
  audio_url: string;
  book_url?: string;
  audio_parts?: AudioPart[];
  duration: number;
  rating: number;
  total_reviews: number;
  total_listens: number;
  is_premium: boolean;
  audio_status?: string;
  audio_error?: string;
};

export function getMediaUrl(path?: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

export async function getStories(): Promise<Story[]> {
  const res = await fetch(`${API_URL}/stories/`, {
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch stories");
  }

  return data.data;
}

export async function getStory(id: string): Promise<Story> {
  const res = await fetch(`${API_URL}/stories/${id}/`, {
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch story");
  }

  return data.data;
}

export async function getAudiobooks(): Promise<Story[]> {
  const stories = await getStories();

  return stories.filter((story) => {
    return (
      story.audio_status === "generated" ||
      story.audio_url ||
      (story.audio_parts && story.audio_parts.length > 0)
    );
  });
}

export async function getPodcasts(): Promise<Story[]> {
  const stories = await getStories();

  return stories.filter((story) => {
    return story.category?.toLowerCase() === "podcast";
  });
}

export async function createStory(formData: FormData) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Please login first before uploading a story.");
  }

  const res = await fetch(`${API_URL}/stories/create/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || data.detail || "Story upload failed");
  }

  return data.data;
}

export async function regenerateAudioParts(storyId: string) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Please login first.");
  }

  const res = await fetch(
    `${API_URL}/stories/${storyId}/regenerate-audio-parts/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Audio generation failed");
  }

  return data.data;
}