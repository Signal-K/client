// import { AutomatonControlPanel, RoverControlPanel } from "@/components/Gameplay/Inventory/Automation";
import { AllAutomatons } from "@/components/Gameplay/Inventory/Automation";
import { AllStructures, CreateStructure } from "@/components/Gameplay/Inventory/Structure";
import UserItems from "@/components/Gameplay/Inventory/UserInventory";
import Layout from "@/components/Layout";
import { useActivePlanet } from "@/context/ActivePlanet";

export default function () {
    // const { activePlanet, activeSector } = useActivePlanet();
    const { activePlanet } = useActivePlanet();
    

    const handleStructureSelected = (structure: any) => {
        console.log('Selected structure: ', structure);
    };

    return (
        <Layout bg={false}>
            <div className="p-5">
                {/* <UserItems /> */}
                {/* <div className="my-4 mb-6 px-3"><AutomatonControlPanel /></div>
                <RoverControlPanel /> */}
                {activePlanet?.id}
                <AllStructures />
                {/* <AllAutomatons /> */}
                <CreateStructure onStructureSelected={handleStructureSelected} activeSectorId={0} />
            </div>
        </Layout>
    );
};