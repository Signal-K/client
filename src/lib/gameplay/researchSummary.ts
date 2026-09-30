import { edgeToken, RESEARCH_SUMMARY_EDGE_API } from "./edgeApi";

const SUMMARY_URL = "/api/gameplay/research/summary";
const TTL_MS = 10_000;

let inFlight: Promise<Response> | null = null;
let fetchedAt = 0;

async function requestSummary(): Promise<Response> {
  const token = await edgeToken();
  if (token) {
    try {
      const response = await fetch(RESEARCH_SUMMARY_EDGE_API, {
        cache: "no-store",
        headers: { authorization: `Bearer ${token}` },
      });
      if (response.ok) return response;
    } catch {
      // Fall through to the Next route.
    }
  }
  return fetch(SUMMARY_URL, { cache: "no-store" });
}

// Many screens read the research summary at once; share one request between
// them and reuse it briefly. Callers get an independent Response each time so
// they can keep calling .json() as before.
export function fetchResearchSummary(): Promise<Response> {
  if (!inFlight || Date.now() - fetchedAt > TTL_MS) {
    fetchedAt = Date.now();
    const request = requestSummary();
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
