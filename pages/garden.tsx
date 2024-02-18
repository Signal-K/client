import React from "react";
// import Garden from "../components/Gameplay/Garden";
import { Garden } from "../components/Content/Planets/GalleryList";
import Layout, { LayoutNoNav } from "../components/Section/Layout";
import Navbar from "../components/Section/Navbar";

export default function GardenPage() {
    return (
        <LayoutNoNav>
            {/* <Navbar /> */}
            <Garden onClose={function (): void {
                throw new Error("Function not implemented.");
            } } />
        </LayoutNoNav>
    )
}