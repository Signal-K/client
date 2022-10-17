import { AutomatonControlPanel } from "@/components/Gameplay/Inventory/Automation";
import Layout from "@/components/Layout";
import { RoverWindow } from "@/components/rover-window";

export default function () {
    return (
        <Layout bg={false}>
            <div className="my-4 mb-6 px-3"><AutomatonControlPanel /></div>
            <RoverWindow />
            <p>Whatever I want goes in here, lol</p>
        </Layout>
    );
};