"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EnhancedAuthPage from "@/src/components/profile/auth/EnhancedAuth";
import { useAuthUser } from "@/src/hooks/useAuthUser";

function LoginContent() {
    const { user, isLoading } = useAuthUser();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
      if (isLoading || !user) return;
      const nextPath = searchParams.get("next");
      const destination =
        nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
          ? nextPath
          : "/game";
      router.replace(destination);
    }, [isLoading, user, router, searchParams]);

    return <EnhancedAuthPage />;
}

export default function Login() {
  return (
    <Suspense fallback={<EnhancedAuthPage />}>
      <LoginContent />
    </Suspense>
  );
}
