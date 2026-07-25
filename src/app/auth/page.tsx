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
      // Full navigation (not router.replace) so the server middleware
      // re-checks auth against a fresh request instead of racing the
      // client SDK's optimistic session state against cookie propagation.
      window.location.assign(destination);
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
