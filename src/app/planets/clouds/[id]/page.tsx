import CloudDetailsClient from '@/src/components/discovery/planets/client';

type MyCloudPageProps = {
    params: {
      id: number;
    };
};
  
export default function Page({ params }: MyCloudPageProps) {
    return <CloudDetailsClient id={params.id} />;
};