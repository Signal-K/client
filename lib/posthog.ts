import { PostHog } from "posthog-node"

// NOTE: This is a Node.js client, so you can use it for sending events from the server side to PostHog.
export default function PostHogClient() {
  const region = (process.env.posthog_region ?? process.env.POSTHOG_REGION ?? "US Cloud").toLowerCase()
  const host = region.includes("eu") ? "https://eu.i.posthog.com" : "https://us.i.posthog.com"
  const apiKey =
    process.env.posthog_api_key ??
    process.env.POSTHOG_API_KEY ??
    process.env.NEXT_PUBLIC_POSTHOG_KEY

  const posthogClient = new PostHog(apiKey!, {
    host,
    flushAt: 1,
    flushInterval: 0,
  })
  return posthogClient
}
