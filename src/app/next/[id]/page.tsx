import { placeholderParams } from "@/src/lib/routing/staticParams";

import LegacyClassifyRedirect from "./LegacyClassifyRedirect";

export function generateStaticParams() {
  return placeholderParams("id");
}

export default function LegacyClassifyPage() {
  return <LegacyClassifyRedirect />;
}
