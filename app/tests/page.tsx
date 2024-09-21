"use client";

import React, { useEffect, useState } from "react";
import ClassificationViewer, { ClassificationViewerAll } from "../components/(create)/(classifications)/YourClassifications";
import { DataSourcesModal } from "../components/(structures)/Data/unlockNewDataSources";

export default function TestPage() {
    return (
        <div>
            {/* <ClassificationViewer classificationType="planet" />
            <ClassificationViewer classificationType="roverImg" />
            <ClassificationViewerAll /> */}

            {/* <DataSourcesModal structureId='3104' structure="Zoodex" /> */}
            <DataSourcesModal structureId='3103' structure="Telescope" />
        </div>
    );
};