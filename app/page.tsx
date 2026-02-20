"use client";

import Landing from "./apt/page";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthUser } from "@/src/hooks/useAuthUser";

// Root page: show landing for logged-out users.
export default function HomePage() {
  const { user, isLoading } = useAuthUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/game');
    }
  }, [isLoading, user, router]);

  return <Landing />;
};