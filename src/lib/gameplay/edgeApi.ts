// Read routes that have been ported to the Free-plan API Worker (workers/api).
// The Worker is reached at /api/v1/* on the deployed hosts; `next dev` has no
// such route, so the flag stays off (falling back to the Next handler) until the
// environment is built with NEXT_PUBLIC_EDGE_API=true.
export const EDGE_API_ENABLED = process.env.NEXT_PUBLIC_EDGE_API === "true";

export const ANOMALIES_API = EDGE_API_ENABLED ? "/api/v1/anomalies" : "/api/gameplay/anomalies";

export const RESEARCH_SUMMARY_EDGE_API = "/api/v1/research/summary";
