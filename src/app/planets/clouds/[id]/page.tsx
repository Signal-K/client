import CloudDetailsClient from '@/src/components/discovery/planets/client';

type MyCloudPageProps = {
    params: Promise<{
        id: string;
    }>;
}

export default async function Page(props: MyCloudPageProps) {
    const params = await props.params;
    return <CloudDetailsClient id={parseInt(params.id)} />;
}