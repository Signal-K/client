"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

/**
 * Signed-in visitors go straight to the garden hub. Middleware did this on the
 * server; the Cloudflare static export (SSC-31) has no middleware, so the
 * browser does it once Clerk has loaded.
 */
export function LandingSignedInRedirect() {
  const { isLoaded, userId } = useAuth();

  useEffect(() => {
    if (isLoaded && userId) window.location.replace("/game?from=landing");
  }, [isLoaded, userId]);

  return null;
}
