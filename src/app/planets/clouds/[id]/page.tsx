import { placeholderParams } from "@/src/lib/routing/staticParams";

import CloudPageClient from "./CloudPageClient";

export function generateStaticParams() {
  return placeholderParams("id");
}

export default function Page() {
  return <CloudPageClient />;
}
