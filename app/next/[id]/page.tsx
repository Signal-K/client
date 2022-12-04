import ClientClassificationPage from "@/src/components/projects/(classifications)/NextScene";

type Props = {
  params: { id: string };
};

export default function Page({ params }: Props) {
  const { id } = params;

  if (!id) return null; // or trigger notFound();

  return <ClientClassificationPage id={id} />;
};