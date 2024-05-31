import { ReactNode } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { PlanetLayout } from "@/ui/Sections/PlanetLayout";

interface LayoutProps {
    children: ReactNode;
    bg: any;
}

const backgroundImages = {
    1: "https://cdn.cloud.scenario.com/assets-transform/asset_HEjw5SonZK4Ajkmq7VupdoVw?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy10cmFuc2Zvcm0vYXNzZXRfSEVqdzVTb25aSzRBamttcTdWdXBkb1Z3P3A9MTAwKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcxNzgwNDc5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=eD95JPP7H06bHs9KU9varzA3gJSxikmqBhfe4Iu5f~RGNlrslOEyzUEl1bAZsb23oTaoGGX3yggS1--HigdL3CE93qEd0cEZxc0EuTp8aH~snVROVfNarzr5EkcrwQL5EohBGvDhdS9G7-oS0HoSIdWnqSZtBbhyQVUjFuRFBYy4y5lxJ2evvSIagL7CWNGUJS5uFu5~fCUeKwwVPsKXmntmpViOeqVCCJOx-FJtRLWS9x83Z-Ltv96i8vo1Dh5wwr92daDuqv7Hh2~RRIbmdHVY~DSdG3wdGtOvTiKK~3SESU67iq-PScgU6gUAlnEYnMyxsY-jDBe-K1lMlw-dsg__",
    2: "https://cdn.cloud.scenario.com/assets-transform/asset_HEjw5SonZK4Ajkmq7VupdoVw?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy10cmFuc2Zvcm0vYXNzZXRfSEVqdzVTb25aSzRBamttcTdWdXBkb1Z3P3A9MTAwKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcxNzgwNDc5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=eD95JPP7H06bHs9KU9varzA3gJSxikmqBhfe4Iu5f~RGNlrslOEyzUEl1bAZsb23oTaoGGX3yggS1--HigdL3CE93qEd0cEZxc0EuTp8aH~snVROVfNarzr5EkcrwQL5EohBGvDhdS9G7-oS0HoSIdWnqSZtBbhyQVUjFuRFBYy4y5lxJ2evvSIagL7CWNGUJS5uFu5~fCUeKwwVPsKXmntmpViOeqVCCJOx-FJtRLWS9x83Z-Ltv96i8vo1Dh5wwr92daDuqv7Hh2~RRIbmdHVY~DSdG3wdGtOvTiKK~3SESU67iq-PScgU6gUAlnEYnMyxsY-jDBe-K1lMlw-dsg__",
    3: "https://cdn.cloud.scenario.com/assets-transform/asset_HEjw5SonZK4Ajkmq7VupdoVw?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy10cmFuc2Zvcm0vYXNzZXRfSEVqdzVTb25aSzRBamttcTdWdXBkb1Z3P3A9MTAwKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcxNzgwNDc5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=eD95JPP7H06bHs9KU9varzA3gJSxikmqBhfe4Iu5f~RGNlrslOEyzUEl1bAZsb23oTaoGGX3yggS1--HigdL3CE93qEd0cEZxc0EuTp8aH~snVROVfNarzr5EkcrwQL5EohBGvDhdS9G7-oS0HoSIdWnqSZtBbhyQVUjFuRFBYy4y5lxJ2evvSIagL7CWNGUJS5uFu5~fCUeKwwVPsKXmntmpViOeqVCCJOx-FJtRLWS9x83Z-Ltv96i8vo1Dh5wwr92daDuqv7Hh2~RRIbmdHVY~DSdG3wdGtOvTiKK~3SESU67iq-PScgU6gUAlnEYnMyxsY-jDBe-K1lMlw-dsg__",
    4: "https://cdn.cloud.scenario.com/assets-transform/asset_sYraHMnuKLMpacKpBsR8TjCj?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy10cmFuc2Zvcm0vYXNzZXRfc1lyYUhNbnVLTE1wYWNLcEJzUjhUakNqP3A9MTAwKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcxNzE5OTk5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=lYc4k4L9qOm7lURP9EBdjrzLadXIZiNM989Cnxowqq2hRCIbtDcwCtQni3UCJysLDr0oiuviats892BUJOMMJ5VinAUDR5g4ktAsjJF979FT7ddjz6y-PBHE05nbIHLYM6fMllAZ-YFF9NI9WY~~fL69~zyWuvplAjq5-qFit08eaT2kPz8lYeWGUptQQdGril59-rdws7f0YNlPxt33LtgBPTJtlGj7XGbSRv1WEeoO-HxEklDYE-q4Z7QzB1miUw3jS2T-y3YliPrEWA-Tjipx0Z4841-j8piJtZM3SeiFxiIlygIYT~8JPxjwEFG5~Q3NaJvtlBX-GYtQqIxPMQ__&format=jpeg",
    5: "https://cdn.cloud.scenario.com/assets-transform/asset_HEjw5SonZK4Ajkmq7VupdoVw?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy10cmFuc2Zvcm0vYXNzZXRfSEVqdzVTb25aSzRBamttcTdWdXBkb1Z3P3A9MTAwKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcxNzgwNDc5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=eD95JPP7H06bHs9KU9varzA3gJSxikmqBhfe4Iu5f~RGNlrslOEyzUEl1bAZsb23oTaoGGX3yggS1--HigdL3CE93qEd0cEZxc0EuTp8aH~snVROVfNarzr5EkcrwQL5EohBGvDhdS9G7-oS0HoSIdWnqSZtBbhyQVUjFuRFBYy4y5lxJ2evvSIagL7CWNGUJS5uFu5~fCUeKwwVPsKXmntmpViOeqVCCJOx-FJtRLWS9x83Z-Ltv96i8vo1Dh5wwr92daDuqv7Hh2~RRIbmdHVY~DSdG3wdGtOvTiKK~3SESU67iq-PScgU6gUAlnEYnMyxsY-jDBe-K1lMlw-dsg__",
    6: "https://cdn.cloud.scenario.com/assets-transform/asset_HEjw5SonZK4Ajkmq7VupdoVw?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy10cmFuc2Zvcm0vYXNzZXRfSEVqdzVTb25aSzRBamttcTdWdXBkb1Z3P3A9MTAwKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcxNzgwNDc5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=eD95JPP7H06bHs9KU9varzA3gJSxikmqBhfe4Iu5f~RGNlrslOEyzUEl1bAZsb23oTaoGGX3yggS1--HigdL3CE93qEd0cEZxc0EuTp8aH~snVROVfNarzr5EkcrwQL5EohBGvDhdS9G7-oS0HoSIdWnqSZtBbhyQVUjFuRFBYy4y5lxJ2evvSIagL7CWNGUJS5uFu5~fCUeKwwVPsKXmntmpViOeqVCCJOx-FJtRLWS9x83Z-Ltv96i8vo1Dh5wwr92daDuqv7Hh2~RRIbmdHVY~DSdG3wdGtOvTiKK~3SESU67iq-PScgU6gUAlnEYnMyxsY-jDBe-K1lMlw-dsg__"
};

export default function Layout({ children }: LayoutProps) {
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    // Asserting that planetId is a number here
    const planetId = Number(activePlanet?.id?? 1); 

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                backgroundImage: `url(${(backgroundImages as any)[planetId]})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}            
        >
            <PlanetLayout>
                {children}
            </PlanetLayout>
        </div>
    );
}