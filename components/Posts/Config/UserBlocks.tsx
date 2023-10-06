import React from "react";
import { useSession } from "@supabase/auth-helpers-react";
import UserPostCount from "./UserPostsTotal";
import { Grid, Card } from "@tremor/react";
import AccountEditor from "../../Core/UpdateProfile";
import IndexAuth from "../../Core/indexAuth";
import OwnedItemsList from "../../Gameplay/Inventory/userOwnedItems";
import OwnedPlanetsList from "../../Gameplay/Inventory/userOwnedPlanets";
import OwnedPlanetsListBlock from "../../Blocks/userPlanetsBlock";
import MissionSelectionForIndexPage from "../../Core/intro/missionSelectIndex";
import MySpaceships from "../../Gameplay/Spaceships/mySpaceships";

export default function UserProfileBlocks () {
    const session = useSession();
    const userId = session?.user?.id

    return (<div>
        <main className="p-4 md:p-10 mx-auto max-w-7xl">
            <Grid numItemsSm={2} numItemsLg={2} className="gap-6">
                <Card>
                    <div className="container mx-auto py-8">
                        <UserPostCount userId={userId} />
                    </div>
                </Card>
                <Card>
                    <div className="container mx-auto py-8">
                        {/* <AccountEditor session={session} /> */}
                        {/* <IndexAuth /> */}
                        <OwnedPlanetsListBlock /> 
                    </div>
                </Card>
            </Grid><br />
            <Card>
                <div className="container mx-auto py-8">
                    <OwnedItemsList />
                    <MySpaceships />
                </div>
            </Card><br />
            <Card><MissionSelectionForIndexPage /></Card>
        </main></div>
    );
}

export function UserProfileEditBlock () {
    const session = useSession();

    return (
        <Card>
            <div className="container mx-auto py-8">
                {/* <AccountEditor session={session} /> */}
                <IndexAuth />
            </div>
        </Card>
    )
}