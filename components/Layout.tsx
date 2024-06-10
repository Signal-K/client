import { ReactNode } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { PlanetLayout } from "@/ui/Sections/PlanetLayout";

interface LayoutProps {
    children: ReactNode;
    bg: any;
}

const backgroundImages = {
    1: "https://cdn.cloud.scenario.com/assets/asset_pQFLLbbM12LukRYkznE6jqeo?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF9wUUZMTGJiTTEyTHVrUllrem5FNmpxZW8~cD0xMDAqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzE5MDE0Mzk5fX19XX0_&Key-Pair-Id=K36FIAB9LE2OLR&Signature=CLGtxjLwa3mLaN9L0LLyN1TP9q57cZ0w-V3aOWbfpvxXSl4XWx~OX4K8uwRTK4FGGPKBBMdTnPY49taGwrHIUJ4H9MK5W0WazCDWthqqBYqRe4ZMl6AunqKAT-SOu4tH0D~8uLc1oz2N0sleHHfapB61acyfYNjYqQ1SO63y8yDI1XuNL8YPE6OIffXMhAId~3E4roY9Q86WEpz6-RrehSoW~N-V6ox0QFm3llV5MyzvZg1B56wcsa3FcrCmO3EQrKckA1EiMOsyaHK7T4EN68A20Jntn3pw7e38lQL-6xSL4eyB8d8A1QvSGfakeRTR~xUfalHN5IrICztk9c9H7g__&format=jpeg",
    2: "https://cdn.cloud.scenario.com/assets/asset_pQFLLbbM12LukRYkznE6jqeo?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF9wUUZMTGJiTTEyTHVrUllrem5FNmpxZW8~cD0xMDAqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzE5MDE0Mzk5fX19XX0_&Key-Pair-Id=K36FIAB9LE2OLR&Signature=CLGtxjLwa3mLaN9L0LLyN1TP9q57cZ0w-V3aOWbfpvxXSl4XWx~OX4K8uwRTK4FGGPKBBMdTnPY49taGwrHIUJ4H9MK5W0WazCDWthqqBYqRe4ZMl6AunqKAT-SOu4tH0D~8uLc1oz2N0sleHHfapB61acyfYNjYqQ1SO63y8yDI1XuNL8YPE6OIffXMhAId~3E4roY9Q86WEpz6-RrehSoW~N-V6ox0QFm3llV5MyzvZg1B56wcsa3FcrCmO3EQrKckA1EiMOsyaHK7T4EN68A20Jntn3pw7e38lQL-6xSL4eyB8d8A1QvSGfakeRTR~xUfalHN5IrICztk9c9H7g__&format=jpeg",
    3: "https://cdn.cloud.scenario.com/assets/asset_pQFLLbbM12LukRYkznE6jqeo?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF9wUUZMTGJiTTEyTHVrUllrem5FNmpxZW8~cD0xMDAqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzE5MDE0Mzk5fX19XX0_&Key-Pair-Id=K36FIAB9LE2OLR&Signature=CLGtxjLwa3mLaN9L0LLyN1TP9q57cZ0w-V3aOWbfpvxXSl4XWx~OX4K8uwRTK4FGGPKBBMdTnPY49taGwrHIUJ4H9MK5W0WazCDWthqqBYqRe4ZMl6AunqKAT-SOu4tH0D~8uLc1oz2N0sleHHfapB61acyfYNjYqQ1SO63y8yDI1XuNL8YPE6OIffXMhAId~3E4roY9Q86WEpz6-RrehSoW~N-V6ox0QFm3llV5MyzvZg1B56wcsa3FcrCmO3EQrKckA1EiMOsyaHK7T4EN68A20Jntn3pw7e38lQL-6xSL4eyB8d8A1QvSGfakeRTR~xUfalHN5IrICztk9c9H7g__&format=jpeg",
    4: "https://cdn.cloud.scenario.com/assets/asset_pQFLLbbM12LukRYkznE6jqeo?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF9wUUZMTGJiTTEyTHVrUllrem5FNmpxZW8~cD0xMDAqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzE5MDE0Mzk5fX19XX0_&Key-Pair-Id=K36FIAB9LE2OLR&Signature=CLGtxjLwa3mLaN9L0LLyN1TP9q57cZ0w-V3aOWbfpvxXSl4XWx~OX4K8uwRTK4FGGPKBBMdTnPY49taGwrHIUJ4H9MK5W0WazCDWthqqBYqRe4ZMl6AunqKAT-SOu4tH0D~8uLc1oz2N0sleHHfapB61acyfYNjYqQ1SO63y8yDI1XuNL8YPE6OIffXMhAId~3E4roY9Q86WEpz6-RrehSoW~N-V6ox0QFm3llV5MyzvZg1B56wcsa3FcrCmO3EQrKckA1EiMOsyaHK7T4EN68A20Jntn3pw7e38lQL-6xSL4eyB8d8A1QvSGfakeRTR~xUfalHN5IrICztk9c9H7g__&format=jpeg",
    5: "https://cdn.cloud.scenario.com/assets/asset_pQFLLbbM12LukRYkznE6jqeo?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF9wUUZMTGJiTTEyTHVrUllrem5FNmpxZW8~cD0xMDAqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzE5MDE0Mzk5fX19XX0_&Key-Pair-Id=K36FIAB9LE2OLR&Signature=CLGtxjLwa3mLaN9L0LLyN1TP9q57cZ0w-V3aOWbfpvxXSl4XWx~OX4K8uwRTK4FGGPKBBMdTnPY49taGwrHIUJ4H9MK5W0WazCDWthqqBYqRe4ZMl6AunqKAT-SOu4tH0D~8uLc1oz2N0sleHHfapB61acyfYNjYqQ1SO63y8yDI1XuNL8YPE6OIffXMhAId~3E4roY9Q86WEpz6-RrehSoW~N-V6ox0QFm3llV5MyzvZg1B56wcsa3FcrCmO3EQrKckA1EiMOsyaHK7T4EN68A20Jntn3pw7e38lQL-6xSL4eyB8d8A1QvSGfakeRTR~xUfalHN5IrICztk9c9H7g__&format=jpeg",
    6: "https://cdn.cloud.scenario.com/assets/asset_pQFLLbbM12LukRYkznE6jqeo?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF9wUUZMTGJiTTEyTHVrUllrem5FNmpxZW8~cD0xMDAqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzE5MDE0Mzk5fX19XX0_&Key-Pair-Id=K36FIAB9LE2OLR&Signature=CLGtxjLwa3mLaN9L0LLyN1TP9q57cZ0w-V3aOWbfpvxXSl4XWx~OX4K8uwRTK4FGGPKBBMdTnPY49taGwrHIUJ4H9MK5W0WazCDWthqqBYqRe4ZMl6AunqKAT-SOu4tH0D~8uLc1oz2N0sleHHfapB61acyfYNjYqQ1SO63y8yDI1XuNL8YPE6OIffXMhAId~3E4roY9Q86WEpz6-RrehSoW~N-V6ox0QFm3llV5MyzvZg1B56wcsa3FcrCmO3EQrKckA1EiMOsyaHK7T4EN68A20Jntn3pw7e38lQL-6xSL4eyB8d8A1QvSGfakeRTR~xUfalHN5IrICztk9c9H7g__&format=jpeg"
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