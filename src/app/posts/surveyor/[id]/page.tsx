import { placeholderParams } from "@/src/lib/routing/staticParams";

import SurveyorPostClient from "./SurveyorPostClient";

export function generateStaticParams() {
  return placeholderParams("id");
}

export default function Page() {
  return <SurveyorPostClient />;
}
