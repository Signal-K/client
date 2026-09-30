"use client";

import { DynamicRouteRedirect } from "@/src/components/routing/DynamicRouteRedirect";

const to = (id: string) => `/planets/edit/${encodeURIComponent(id)}`;

export default function PlanetRedirect() {
  return <DynamicRouteRedirect pattern="/planets/[id]" to={to} />;
}
