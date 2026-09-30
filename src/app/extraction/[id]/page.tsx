import { placeholderParams } from "@/src/lib/routing/staticParams";

import ExtractionPageClient from "./ExtractionPageClient";

export function generateStaticParams() {
  return placeholderParams("id");
}

export default function Page() {
  return <ExtractionPageClient />;
}
