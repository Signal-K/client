"use client";

import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";

export function LandingAnalytics() {
  const posthog = usePostHog();
  useEffect(() => {
    posthog?.capture("landing_page_viewed");
  }, [posthog]);
  return null;
}

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
