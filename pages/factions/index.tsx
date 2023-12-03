// FCDB-13
// Will perform dynamic routes, but it will all go into the index route.
// I think we'll have it that there will be 6 different factions (independant of species), each has their home planet (one of the 6 base planets), you pick your faction and you get assigned a planet/part of planet to classify & collate
// Row in `basePlanets` `Faction`': Will later be a foreign key to the (currently non-existent) `factions` table. Will be labelled 1-6, for simplicity with pulling ids in the client code. Naming schema & other variables will be set manually in client repo UNTIL new table is created
// Add in a toggle to view other factions once you've "earnt their trust", right now we don't need or want people to view others' homebases.

import React from "react";
import Layout from "../../components/Section/Layout";
import HomebaseSelector from "../../components/Gameplay/FactionHomebase";

export default function Homebase() {
    const factionIdBase: number = 1 as number; // Will add a column to the `profiles` table imminently.

    // Get user data from here, determine their faction

    return (
        <Layout>
            <HomebaseSelector factionId={factionIdBase} />
        </Layout>
    );
};