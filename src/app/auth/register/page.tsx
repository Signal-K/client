"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import EnhancedAuthPage from "@/src/components/profile/auth/EnhancedAuth";
import { useAuthUser } from "@/src/hooks/useAuthUser";

const Register = () => {
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
};

export default Register;
