"use client";

import ClientClassificationPage from "@/src/components/projects/(classifications)/NextScene";
import { useRouteParams } from "@/src/lib/routing/useRouteParams";

export default function ClassifyPageClient() {
  const params = useRouteParams<"id">("/classify/[id]");
  if (!params?.id) return null;
  return <ClientClassificationPage id={params.id} />;
}
