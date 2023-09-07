import React from "react";
import CoreLayout from "../../../../components/Core/Layout";
import OwnedItemsList from "../../../../components/Gameplay/Inventory/userOwnedItems";
import Crucible1BaseplanetList from "../../../../components/onboarding/Preflight/1_CruciblePlanetList";
import { Container } from "react-bootstrap";

export default function CrucibleFlightCheck () {
    return (
        <CoreLayout>
            <Container><p>Classify these planets!</p> <br /></Container>
            <Crucible1BaseplanetList />
            {/* <OwnedItemsList /> */}
        </CoreLayout>
    );
};