"use client";

import React, { useEffect, useState } from "react";
import { TestLayout } from "../components/(scenes)/planetScene/layout";
import ChooseClassificationStarter from "../components/(scenes)/chapters/one/ChooseClassifications";
import { AllStructures } from "../components/(structures)/Structures";
import ClassificationSummary from "../components/(anomalies)/(planets)/classificationsGenerated";
import StructureRepair from "../components/(structures)/Config/RepairStructure";

export default function TestPage() {
    return (
        <div>
            <ClassificationSummary />
            <ChooseClassificationStarter />
            {/* <AllStructures /> */}
        </div>
    )
}