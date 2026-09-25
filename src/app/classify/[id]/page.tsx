import { placeholderParams } from "@/src/lib/routing/staticParams";

import ClassifyPageClient from "./ClassifyPageClient";

export function generateStaticParams() {
  return placeholderParams("id");
}

export default function Page() {
  return <ClassifyPageClient />;
}
