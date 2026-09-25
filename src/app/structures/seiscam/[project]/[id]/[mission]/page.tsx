import { placeholderParams } from "@/src/lib/routing/staticParams";

import SeiscamProjectClient from "./SeiscamProjectClient";

export function generateStaticParams() {
  return placeholderParams("project", "id", "mission");
}

export default function Page() {
  return <SeiscamProjectClient />;
}
