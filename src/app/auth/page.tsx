"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import EnhancedAuthPage from "@/src/components/profile/auth/EnhancedAuth";
import { useAuthUser } from "@/src/hooks/useAuthUser";

function LoginContent() {
    const { user, isLoading } = useAuthUser();
    const searchParams = useSearchParams();
    const posthog = usePostHog();

    useEffect(() => {
      const ref = searchParams.get("ref");
      if (!ref || typeof window === "undefined") return;
      const cleaned = ref.trim();
      if (!/^[A-Za-z0-9]{3,32}$/.test(cleaned)) return;
      try {
        window.localStorage.setItem("pending_referral_code", cleaned);
      } catch {
        // Ignore storage restrictions.
      }
    }, [searchParams]);

    useEffect(() => {
      if (isLoading || !user) return;
      posthog?.capture("login_completed", { userId: user.id });
      const nextPath = searchParams.get("next");
      const destination =
        nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
          ? nextPath
          : "/onboarding";

      let cancelled = false;
      let retryTimer: ReturnType<typeof setTimeout> | undefined;

      const confirmServerSession = async () => {
        // Clerk's client state can become signed-in a moment before the
        // session cookie is visible to middleware/server components. Do not
        // navigate until the server agrees, or a failed /game request will
        // bounce back here and immediately start the same loop again.
        for (let attempt = 0; attempt < 8 && !cancelled; attempt += 1) {
          try {
            const response = await fetch("/api/auth/session", { cache: "no-store" });
            if (response.ok) {
              const payload = (await response.json()) as { authenticated?: boolean };
              if (payload.authenticated) {
                window.location.assign(destination);
                return;
              }
            }
          } catch {
            // Keep the auth UI available if the confirmation request fails.
          }

          await new Promise<void>((resolve) => {
            retryTimer = setTimeout(resolve, 250 * (attempt + 1));
          });
        }
      };

      void confirmServerSession();

      return () => {
        cancelled = true;
        if (retryTimer) clearTimeout(retryTimer);
      };
    }, [isLoading, user, searchParams, posthog]);

    return <EnhancedAuthPage mode="sign-in" />;
}

export default function Login() {
  return (
    <Suspense fallback={<EnhancedAuthPage mode="sign-in" />}>
      <LoginContent />
    </Suspense>
  );
}
