import ClientClassificationPage from "@/src/components/projects/(classifications)/NextScene";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page(props: Props) {
  const params = await props.params;
  const { id } = params;

  if (!id) return null; // or trigger notFound();

  return <ClientClassificationPage id={id} />;
};