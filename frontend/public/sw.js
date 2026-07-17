const VERSION = "v3";
const SHELL_CACHE = `echotale-shell-${VERSION}`;
const PAGE_CACHE = `echotale-pages-${VERSION}`;
const ASSET_CACHE = `echotale-assets-${VERSION}`;
const API_CACHE = `echotale-public-api-${VERSION}`;

const APP_SHELL = [
  "/",
  "/offline",
  "/dashboard",
  "/explore",
  "/library",
  "/bookmarks",
  "/history",
  "/authors",
  "/audiobooks",
  "/podcasts",
  "/premium",
  "/profile",
  "/settings",
  "/auth/login",
  "/auth/signup",
  "/manifest.webmanifest",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/premium-story-world.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => Promise.allSettled(APP_SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const current = new Set([SHELL_CACHE, PAGE_CACHE, ASSET_CACHE, API_CACHE]);
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("echotale-") && !current.has(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function networkFirst(request, cacheName, fallback) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) || (fallback ? await caches.match(fallback) : undefined) || Response.error();
  }
}

function isPublicApiGet(url, request) {
  if (request.method !== "GET" || !url.pathname.startsWith("/api/")) return false;
  return !url.pathname.startsWith("/api/auth/") &&
    !url.pathname.startsWith("/api/profile") &&
    !url.pathname.startsWith("/api/notifications") &&
    !url.pathname.startsWith("/api/library") &&
    !url.pathname.startsWith("/api/bookmarks") &&
    !url.pathname.startsWith("/api/history") &&
    !url.pathname.startsWith("/api/subscriptions/current");
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, PAGE_CACHE, "/offline"));
    return;
  }

  if (url.origin === self.location.origin && (url.pathname.startsWith("/_next/static/") || ["style", "script", "font", "image"].includes(request.destination))) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  if (isPublicApiGet(url, request)) {
    event.respondWith(networkFirst(request, API_CACHE));
  }
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
