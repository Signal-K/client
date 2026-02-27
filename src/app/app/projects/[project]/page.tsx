import { redirect } from "next/navigation";

type Params = { project: string };

const LEGACY_PROJECT_REDIRECTS: Record<string, string> = {
  "disk-detective": "/structures/telescope/disk-detective",
  "sunspots": "/structures/telescope/sunspots",
  "daily-minor-planet": "/structures/telescope/daily-minor-planet",
  "planet-hunters": "/structures/telescope/planet-hunters",
  "ai-for-mars": "/structures/balloon/landmarks",
  "mars-cloud-shapes": "/structures/balloon/clouds",
  "cloudspotting": "/structures/balloon/clouds",
  "jovian-vortex-hunter": "/structures/balloon/storms",
  "planet-four": "/structures/balloon/surface",
};

export default async function LegacyProjectsPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { project } = await params;
  const target = LEGACY_PROJECT_REDIRECTS[project];
  if (!target) {
    redirect("/game");
  }
  redirect(target);
}
