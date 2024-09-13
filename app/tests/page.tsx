"use client";

import React, { useEffect, useState } from "react";
import { TestLayout } from "../components/(scenes)/planetScene/layout";
import ClassificationViewer from "../components/(create)/(classifications)/YourClassifications";
import { AdvancedTechTreeComponent } from "../components/(structures)/Research/TechTree";

export default function TestPage() {
    return (
        <div>
            <ClassificationViewer classificationType="planet" />
            <AdvancedTechTreeComponent />
        </div>
    );
};