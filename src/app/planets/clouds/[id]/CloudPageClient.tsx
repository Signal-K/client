"use client";

import CloudDetailsClient from "@/src/components/discovery/planets/client";
import { useRouteParams } from "@/src/lib/routing/useRouteParams";

export default function CloudPageClient() {
  const params = useRouteParams<"id">("/planets/clouds/[id]");
  if (!params?.id) return null;
  return <CloudDetailsClient id={parseInt(params.id)} />;
}
