"use client";

import Landing from "./apt/page";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Root page: show landing for logged-out users.
export default function HomePage() {
  const { session, isLoading } = useSessionContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && session) {
      router.replace('/game');
    }
  }, [isLoading, session, router]);

  return <Landing />;
}
