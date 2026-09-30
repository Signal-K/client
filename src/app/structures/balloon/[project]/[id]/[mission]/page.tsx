import { placeholderParams } from "@/src/lib/routing/staticParams";

import BalloonClassifyClient from "./BalloonClassifyClient";

export function generateStaticParams() {
  return placeholderParams("project", "id", "mission");
}

export default function Page() {
  return <BalloonClassifyClient />;
}
