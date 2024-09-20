import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import CoreLayout from "../../../components/Core/Layout";
import AdminPlanetStatusUpdater from "../../../components/Backend/Admin/PlanetStatusMasterControls";
import StarInfoComponent from "../../../components/Gameplay/Planets/Data/RetrieveStarData";
import GeneratePlot from "../../../components/Gameplay/Planets/Data/RetrievePlotImage";

export default function PlanetStatusPage() {
    const supabase = useSupabaseClient();
    const session = useSession();

    return (
        <CoreLayout>
            {/* <AdminPlanetStatusUpdater /> */}
            <StarInfoComponent /><br />
            {/* <GeneratePlot /> */}
        </CoreLayout>
    )
}