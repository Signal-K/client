"use client";

import React, { useEffect, useState } from "react";
import { TestLayout } from "../components/(scenes)/planetScene/layout";
import ChooseClassificationStarter from "../components/(scenes)/chapters/one/ChooseClassifications";
import ClassificationSummary from "../components/(anomalies)/(planets)/classificationsGenerated";
import CompletedStarterMissions from "../components/(scenes)/(missions)/CompletedMissions";

export default function TestPage() {
    return (
        <div>
            <ClassificationSummary />
            <CompletedStarterMissions />
            <ChooseClassificationStarter />
            {/* <AllStructures /> */}
        </div>
    )
}