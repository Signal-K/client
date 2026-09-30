import { placeholderParams } from "@/src/lib/routing/staticParams";

import BalloonProjectClient from "./BalloonProjectClient";

export function generateStaticParams() {
  return placeholderParams("project");
}

export default function Page() {
  return <BalloonProjectClient />;
}
