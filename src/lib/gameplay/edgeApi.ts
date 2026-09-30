// Routes ported to the Free-plan API Worker (workers/api), reached at /api/v1/*
// on deployed hosts. `next dev` has no such route, so everything stays on the Next
// handlers until the build sets NEXT_PUBLIC_EDGE_API=true.
export const EDGE_API_ENABLED = process.env.NEXT_PUBLIC_EDGE_API === "true";

export const ANOMALIES_API = EDGE_API_ENABLED ? "/api/v1/anomalies" : "/api/gameplay/anomalies";
export const RESEARCH_SUMMARY_EDGE_API = "/api/v1/research/summary";

type ClerkGlobal = { loaded?: boolean; session?: { getToken: () => Promise<string | null> } | null };

// The Worker only accepts a Clerk bearer token. Without a ready, signed-in Clerk
// session callers use the Next route, which handles signed-out requests itself.
export async function edgeToken(): Promise<string | null> {
  if (!EDGE_API_ENABLED || typeof window === "undefined") return null;
  const clerk = (window as unknown as { Clerk?: ClerkGlobal }).Clerk;
  if (!clerk?.loaded || !clerk.session) return null;
  try {
    return await clerk.session.getToken();
  } catch {
    return null;
  }
}

const NEXT_CLASSIFICATIONS = "/api/gameplay/classifications";
const EDGE_CLASSIFICATIONS = "/api/v1/classifications";

// Drop-in fetch for the classifications list/create route. Reads fall back to the
// Next route if the Worker is unreachable or errors; writes never fall back after
// being sent, so a lost response cannot create a duplicate classification.
export async function classificationsFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const isList = url === NEXT_CLASSIFICATIONS || url.startsWith(`${NEXT_CLASSIFICATIONS}?`);
  const token = isList ? await edgeToken() : null;
  if (!token) return fetch(url, init);

  const isRead = (init.method ?? "GET").toUpperCase() === "GET";
  const headers = new Headers(init.headers);
  headers.set("authorization", `Bearer ${token}`);
  try {
    const response = await fetch(EDGE_CLASSIFICATIONS + url.slice(NEXT_CLASSIFICATIONS.length), { ...init, headers });
    if (isRead && response.status >= 500) return fetch(url, init);
    return response;
  } catch (error) {
    if (isRead) return fetch(url, init);
    throw error;
  }
}
