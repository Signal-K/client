import CoreLayout from "../../components/Core/Layout";
import BackgroundComponent from "../../components/Gameplay/Content/background";
import GlobalInventory from "../../components/Gameplay/Inventory/GlobalInventory";
import InventoryList from "../../components/Gameplay/Inventory/ItemsListComp";
import SupabaseInventoryList from "../../components/Gameplay/Inventory/SupabaseInventoryTest";
import OwnedItemsList from "../../components/Gameplay/Inventory/userOwnedItems";
import OwnedPlanetsList from "../../components/Gameplay/Inventory/userOwnedPlanets";

export default function Inventory () {
    const backgroundImageSlug = '/Galaxy/LocalCluster/localClusterMapBg.png';

    return (
        <CoreLayout>
            {/* <BackgroundComponent backgroundImage='/Galaxy/LocalCluster/localClusterMapBg.pngk'> */}
            {/* <SupabaseInventoryList /> */}
                <OwnedItemsList />
            {/* </BackgroundComponent> */}
        </CoreLayout>
    )
}