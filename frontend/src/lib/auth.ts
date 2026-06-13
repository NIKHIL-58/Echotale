export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;

  const user = localStorage.getItem("user");

  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function logoutUser() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("access_token");
  localStorage.removeItem("user");

  window.location.href = "/auth/login";
}