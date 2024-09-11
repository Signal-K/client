"use client";

import React, { useEffect, useState } from "react";
import { TestLayout } from "../components/(scenes)/planetScene/layout";
import ChooseClassificationStarter from "../components/(scenes)/chapters/one/ChooseClassifications";
import ClassificationViewer from "../components/(create)/(classifications)/YourClassifications";

export default function TestPage() {
    return (
        <div>
            <ClassificationViewer classificationType="planet" />
            <ChooseClassificationStarter />
            {/* <AllStructures /> */}
        </div>
    )
}