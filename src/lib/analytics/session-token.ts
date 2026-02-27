const ANALYTICS_SESSION_TOKEN_KEY = "starsailors_session_token_v1";

function fallbackToken() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateAnalyticsSessionToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const existing = window.sessionStorage.getItem(ANALYTICS_SESSION_TOKEN_KEY);
    if (existing) return existing;

    const generated =
      typeof window.crypto !== "undefined" && typeof window.crypto.randomUUID === "function"
        ? window.crypto.randomUUID()
        : fallbackToken();

    window.sessionStorage.setItem(ANALYTICS_SESSION_TOKEN_KEY, generated);
    return generated;
  } catch {
    return null;
  }
}
