import { placeholderParams } from "@/src/lib/routing/staticParams";

import TelescopeClassifyPageNoSsr from "./TelescopeClassifyPageNoSsr";

export function generateStaticParams() {
  return placeholderParams("project", "id", "mission");
}

export default function Page() {
  return <TelescopeClassifyPageNoSsr />;
}
