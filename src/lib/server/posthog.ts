import { PostHog } from "posthog-node";

let client: PostHog | null | undefined;

function posthogKey(): string | undefined {
  return process.env.posthog_api_key ?? process.env.POSTHOG_API_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
}

export function getPostHogServer(): PostHog | null {
  if (process.env.NODE_ENV === "development") return null;
  if (client !== undefined) return client;
  const apiKey = posthogKey();
  if (!apiKey) {
    client = null;
    return null;
  }
  client = new PostHog(apiKey, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
  });
  return client;
}

export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  const posthog = getPostHogServer();
  if (!posthog) return;
  posthog.capture({ distinctId, event, properties });
  await posthog.flush();
}
