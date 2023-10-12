import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import CoreLayout from "../../../components/Core/Layout";
import AdminPlanetStatusUpdater from "../../../components/Backend/Admin/PlanetStatusMasterControls";

export default function PlanetStatusPage() {
    const supabase = useSupabaseClient();
    const session = useSession();

    return (
        <CoreLayout>
            <AdminPlanetStatusUpdater />
        </CoreLayout>
    )
}