"use client";

import Landing from "./apt/page";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Root page: show landing for logged-out users.
export default function HomePage() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.replace('/game');
    }
  }, [session, router]);

  return <Landing />;
}
