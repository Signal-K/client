import { placeholderParams } from "@/src/lib/routing/staticParams";

import PlanetRedirect from "./PlanetRedirect";

export function generateStaticParams() {
  return placeholderParams("id");
}

export default function Page() {
  return <PlanetRedirect />;
}
