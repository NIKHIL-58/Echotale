import type { Story } from "@/services/storyService";

const BOOKMARKS_KEY = "echotale_bookmarks";
const HISTORY_KEY = "echotale_history";

function readList(key: string): Story[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveList(key: string, stories: Story[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(stories));
}

export function getBookmarks(): Story[] {
  return readList(BOOKMARKS_KEY);
}

export function isBookmarked(storyId: string): boolean {
  return getBookmarks().some((story) => story.id === storyId);
}

export function toggleBookmark(story: Story): boolean {
  const bookmarks = getBookmarks();
  const exists = bookmarks.some((item) => item.id === story.id);

  if (exists) {
    saveList(
      BOOKMARKS_KEY,
      bookmarks.filter((item) => item.id !== story.id)
    );
    return false;
  }

  saveList(BOOKMARKS_KEY, [story, ...bookmarks]);
  return true;
}

export function getHistory(): Story[] {
  return readList(HISTORY_KEY);
}

export function addToHistory(story: Story) {
  const history = getHistory();
  const filtered = history.filter((item) => item.id !== story.id);
  saveList(HISTORY_KEY, [story, ...filtered].slice(0, 50));
}

export function clearHistory() {
  saveList(HISTORY_KEY, []);
}