const SUMMARY_URL = "/api/gameplay/research/summary";
const TTL_MS = 10_000;

let inFlight: Promise<Response> | null = null;
let fetchedAt = 0;

// Many screens read the research summary at once; share one request between
// them and reuse it briefly. Callers get an independent Response each time so
// they can keep calling .json() as before.
export function fetchResearchSummary(): Promise<Response> {
  if (!inFlight || Date.now() - fetchedAt > TTL_MS) {
    fetchedAt = Date.now();
    const request = fetch(SUMMARY_URL, { cache: "no-store" });
    inFlight = request;
    request
      .then((response) => {
        if (!response.ok && inFlight === request) inFlight = null;
      })
      .catch(() => {
        if (inFlight === request) inFlight = null;
      });
  }
  return inFlight.then((response) => response.clone());
}

// Call after anything that changes the summary (unlocking research, new classifications).
export function invalidateResearchSummary() {
  inFlight = null;
  fetchedAt = 0;
}
