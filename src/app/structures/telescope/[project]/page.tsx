import { placeholderParams } from "@/src/lib/routing/staticParams";

import TelescopeProjectClient from "./TelescopeProjectClient";

export function generateStaticParams() {
  return placeholderParams("project");
}

export default function Page() {
  return <TelescopeProjectClient />;
}
