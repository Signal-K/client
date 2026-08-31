// Reports whether a hostname belongs to a local development or on-machine
// preview server. PostHog must not ingest events or record sessions from these
// hosts, because a Fast Refresh crash there is developer noise, not production
// traffic. The check keys on the hostname instead of NODE_ENV so that hosted
// preview builds keep reporting.
export function isDevelopmentHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase()
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized.endsWith(".local")
  )
}
