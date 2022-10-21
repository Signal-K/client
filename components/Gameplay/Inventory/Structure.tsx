// A component to show the structures on the user's active planet

import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

interface StructureSingleProps {
    userStructure: UserStructure;
};

export interface UserStructure {
    id: string;
    item: number;
};

export const StructureSingle: React.FC<StructureSingleProps> = ({ userStructure }) => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    return (
        <p>{activePlanet?.id}</p>
    );
};