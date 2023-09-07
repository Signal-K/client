import PlanetTable from "../../components/Backend/Admin/PlanetsssTable";
import CoreLayout from "../../components/Core/Layout";
import PlanetPage from "../tests/planet";
import React from "react";

export default function PlanetListPage () {
    return (
        <CoreLayout>
            <PlanetTable />
        </CoreLayout>
    );
};