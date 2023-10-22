import React from "react";

interface Sector {
    id: number;
    metadata: string;
};

interface PlanetSectorsProps {
    sectors: Sector[];
}