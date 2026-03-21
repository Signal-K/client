"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import EnhancedAuthPage from "@/src/components/profile/auth/EnhancedAuth";
import { useAuthUser } from "@/src/hooks/useAuthUser";

function LoginContent() {
    const { user, isLoading } = useAuthUser();
    const router = useRouter();
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
      router.replace(destination);
    }, [isLoading, user, router, searchParams, posthog]);

    return <EnhancedAuthPage />;
}

export default function Login() {
  return (
    <Suspense fallback={<EnhancedAuthPage />}>
      <LoginContent />
    </Suspense>
  );
}
