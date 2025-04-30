'use client';

import RelatedClassifications from "@/components/Data/RelatedClassifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function PlanetWrapperWithRelatedClassifications({ params }: { params: { id: string } }) {
    const supabase = useSupabaseClient();

    return (
        <RelatedClassifications parentId={Number(params.id)} />
    );
};