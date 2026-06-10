import { redirect } from "next/navigation";

export default async function PlanetRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/planets/edit/${id}`);
}
