"use client";

import { DynamicRouteRedirect } from "@/src/components/routing/DynamicRouteRedirect";

const to = (id: string) => `/classify/${encodeURIComponent(id)}`;

export default function LegacyClassifyRedirect() {
  return <DynamicRouteRedirect pattern="/next/[id]" to={to} />;
}
