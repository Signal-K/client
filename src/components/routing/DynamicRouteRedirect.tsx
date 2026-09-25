"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useRouteParams } from "@/src/lib/routing/useRouteParams";

/** Client-side replacement for a server redirect() on a statically exported dynamic page. */
export function DynamicRouteRedirect({ pattern, to }: { pattern: string; to: (id: string) => string }) {
  const router = useRouter();
  const params = useRouteParams<"id">(pattern);

  useEffect(() => {
    if (params?.id) router.replace(to(params.id));
  }, [params?.id, router, to]);

  return null;
}
