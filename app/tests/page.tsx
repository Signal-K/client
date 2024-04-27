"use client";

import React, { useEffect, useState } from "react";
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