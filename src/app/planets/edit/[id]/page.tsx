import { placeholderParams } from "@/src/lib/routing/staticParams";

import EditPlanetClient from "./EditPlanetClient";

export function generateStaticParams() {
  return placeholderParams("id");
}

export default function Page() {
  return <EditPlanetClient />;
}
