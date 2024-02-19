import React from "react";
import { Garden } from "../components/Content/Planets/GalleryList";
import Layout, { LayoutNoNav } from "../components/Core/Section/Layout";
import Navbar from "../components/Core/Section/Navbar";

export default function GardenPage() {
    return (
        <LayoutNoNav>
            {/* <Navbar /> */}
            <Garden onClose={function (): void {
                throw new Error("Function not implemented.");
            } } />
        </LayoutNoNav>
    );
};