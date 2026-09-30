export type CommunityActivityRow = { id: number; author: string; type: string; at: string };

const TTL_MS = 60_000;

let inFlight: Promise<CommunityActivityRow[]> | null = null;
let fetchedAt = 0;

// The feed is the same for everyone, so one request serves every component on
// the page (and the CDN serves it across players). Callers that need to hide
// the current player's own rows filter the result themselves.
export function fetchCommunityActivity(): Promise<CommunityActivityRow[]> {
  if (!inFlight || Date.now() - fetchedAt > TTL_MS) {
    fetchedAt = Date.now();
    const request: Promise<CommunityActivityRow[]> = fetch("/api/community-activity")
      .then((res) => (res.ok ? (res.json() as Promise<CommunityActivityRow[]>) : []))
      .catch(() => []);
    inFlight = request;
    void request.then((rows) => {
      if (rows.length === 0 && inFlight === request) inFlight = null;
    });
  }
  return inFlight;
}
