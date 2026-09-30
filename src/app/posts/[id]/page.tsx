import { placeholderParams } from "@/src/lib/routing/staticParams";

import SinglePostClient from "./SinglePostClient";

export function generateStaticParams() {
  return placeholderParams("id");
}

export default function Page() {
  return <SinglePostClient />;
}
