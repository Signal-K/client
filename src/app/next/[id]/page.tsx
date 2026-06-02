import { redirect } from "next/navigation";

export default async function LegacyClassifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/classify/${id}`);
}
