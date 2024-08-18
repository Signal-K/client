"use client"

import { AllStructures } from "@/components/Gameplay/Inventory/Structures/Structure";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import CraftStructure from "@/components/Gameplay/Inventory/Actions/CraftStructure";
import { SingleAutomaton } from "@/components/Gameplay/Inventory/Automatons/Automaton";
import SingleAutomatonCraftItem from "@/components/Gameplay/Inventory/Automatons/AutomatonCrafting";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
// import NavigationMenu from "../(layout)/navigation/pogo-menu";

export default function BuildPanels() {
    const supabase = useSupabaseClient();
    const session = useSession();
}