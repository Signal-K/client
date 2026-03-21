"use client";

import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";

export function LandingAnalytics() {
  const posthog = usePostHog();

  useEffect(() => {
    posthog?.capture("landing_page_viewed");
  }, [posthog]);

  // Event delegation: any element with data-track="event_name" fires that event on click
  useEffect(() => {
    if (!posthog) return;
    const handler = (e: MouseEvent) => {
      const el = (e.target as Element).closest("[data-track]") as HTMLElement | null;
      if (!el) return;
      const event = el.dataset.track!;
      const props = el.dataset.trackProps ? JSON.parse(el.dataset.trackProps) : undefined;
      posthog.capture(event, props);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [posthog]);

  return null;
}

/** Wrap any interactive element to fire a PostHog event on click. */
export function TrackCta({
  event,
  properties,
  children,
}: {
  event: string;
  properties?: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const posthog = usePostHog();
  return (
    <span onClick={() => posthog?.capture(event, properties)}>
      {children}
    </span>
  );
}
