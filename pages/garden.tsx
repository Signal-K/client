import React from "react";
import { Garden } from "../components/Content/Planets/GalleryList";
import { LayoutNoNav } from "../components/_Core/Section/Layout";
import Navbar from "../components/_Core/Section/Navbar";

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