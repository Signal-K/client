"use client"

import { Panels } from "../(layout)/sectionStructure"
import { SidebarLayout } from "../(layout)/sectionStructure";

export default function PageLayout() {
    return (
        // <SidebarLayout leftContent={<div></div>} middleContent={<Panels />} />
        <>
            <Panels />
        </>
    );
};
