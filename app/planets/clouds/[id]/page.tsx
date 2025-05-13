import CloudDetailsClient from './client';

type MyCloudPageProps = {
    params: {
      id: number;
    };
};
  
export default function Page({ params }: MyCloudPageProps) {
    return <CloudDetailsClient id={params.id} />;
};