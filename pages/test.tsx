import { AutomatonControlPanel, RoverControlPanel } from "@/components/Gameplay/Inventory/Automation";
import { StructureSingle } from "@/components/Gameplay/Inventory/Structure";
import Layout from "@/components/Layout";
import { useActivePlanet } from "@/context/ActivePlanet";

export default function () {
    const { activePlanet } = useActivePlanet();

    return (
        <Layout bg={false}>
            {/* <div className="my-4 mb-6 px-3"><AutomatonControlPanel /></div>
            <RoverControlPanel /> */}
            {/* <StructureSingle userStructure={} /> */}
            {activePlanet?.content} Hello
            <StructureSingle />
            <p>Whatever I want goes in here, lol</p>
        </Layout>
    );
};