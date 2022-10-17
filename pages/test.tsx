import { AutomatonControlPanel, RoverControlPanel } from "@/components/Gameplay/Inventory/Automation";
import Layout from "@/components/Layout";

export default function () {
    return (
        <Layout bg={false}>
            <div className="my-4 mb-6 px-3"><AutomatonControlPanel /></div>
            <RoverControlPanel />
            <p>Whatever I want goes in here, lol</p>
        </Layout>
    );
};