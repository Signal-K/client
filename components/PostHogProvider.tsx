"use client";

import { useEffect, useState } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only initialize PostHog on the client side
    if (typeof window !== 'undefined') {
      const initPostHog = async () => {
        try {
          // Use dynamic import with error handling
          const posthogModule = await import("posthog-js");
          const posthog = posthogModule.default;
          
          if (process.env.NEXT_PUBLIC_POSTHOG_KEY && !posthog.__loaded) {
            posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
              api_host: "/ingest",
              ui_host: "https://us.posthog.com",
              loaded: () => {
                setIsLoaded(true);
              },
              capture_pageview: false,
              debug: process.env.NODE_ENV === "development",
            });
          } else if (posthog.__loaded) {
            setIsLoaded(true);
          } else {
            // No PostHog key provided
            setIsLoaded(true);
          }
        } catch (error) {
          console.warn("PostHog failed to load:", error);
          setIsLoaded(true); // Still mark as loaded to not block rendering
        }
      };

      initPostHog();
    } else {
      // On server side, just mark as loaded
      setIsLoaded(true);
    }
  }, []);

  // Always render children regardless of PostHog state
  return <>{children}</>;
}