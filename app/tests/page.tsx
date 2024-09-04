"use client";

import React, { useEffect, useState } from "react";
import { TestLayout } from "../components/(scenes)/planetScene/layout";
import ChooseClassificationStarter from "../components/(scenes)/chapters/one/ChooseClassifications";
import { AllStructures } from "../components/(structures)/Structures";

export default function TestPage() {
    return (
        <div>
            <ChooseClassificationStarter />
            {/* <AllStructures /> */}
        </div>
    )
}