const API_URL = "http://127.0.0.1:8000/api";

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

  if (path.startsWith("http")) {
    return path;
  }

  return `http://127.0.0.1:8000${path}`;
}

export async function getStories(): Promise<Story[]> {
  const res = await fetch(`${API_URL}/stories/`);
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch stories");
  }

  return data.data;
}

export async function getStory(id: string): Promise<Story> {
  const res = await fetch(`${API_URL}/stories/${id}/`);
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch story");
  }

  return data.data;
}

export async function createStory(formData: FormData) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_URL}/stories/create/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Story upload failed");
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