"use client";

import { terrestrialTypes, generateTerrestrialTerrain } from "./terrestrial";
import { gaseousTypes, generateGaseousTerrain } from "./gaseous";

// Get the list of influence types based on landmark category
export function getInfluenceTypes(category: "terrestrial" | "gaseous" = "terrestrial"): string[] {
  return category === "gaseous" ? gaseousTypes : terrestrialTypes
}

// Get the display name for an influence type
export function getInfluenceTypeName(type: string): string {
  const nameMap: Record<string, string> = {
    // Terrestrial types
    mountain: "Mountain Range",
    crater: "Impact Crater",
    valley: "Valley",
    basin: "Basin",
    canyon: "Canyon",
    trench: "Oceanic Trench",
    dune: "Dune Field",
    volcano: "Volcano",
    glacier: "Glacier",
    ocean_ridge: "Ocean Ridge",
    ice_patch: "Ice Patch",
    lava_flow: "Lava Flow",

    // Gaseous types
    storm: "Storm System",
    vortex: "Vortex",
    band: "Cloud Band",
    spot: "Persistent Spot",
    turbulent: "Turbulent Region",
    cyclone: "Cyclonic Storm",
    anticyclone: "Anticyclonic System",
    zonal_flow: "Zonal Flow Pattern",
    jet_stream: "Jet Stream",
    cloud_layer: "Cloud Layer",
    atmospheric_haze: "Atmospheric Haze",
  }

  return nameMap[type] || type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ")
};

export { terrestrialTypes, generateTerrestrialTerrain, gaseousTypes, generateGaseousTerrain };