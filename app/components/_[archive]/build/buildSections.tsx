"use client"

import { AllStructures } from "@/app/components/_[archive]/Gameplay/Inventory/Structures/Structure";
import { Button } from "@/app/components/_[archive]/ui/button";
import React, { useEffect, useState } from "react";
import CraftStructure from "@/app/components/_[archive]/Gameplay/Inventory/Actions/CraftStructure";
import { SingleAutomaton } from "@/app/components/_[archive]/Gameplay/Inventory/Automatons/Automaton";
import SingleAutomatonCraftItem from "@/app/components/_[archive]/Gameplay/Inventory/Automatons/AutomatonCrafting";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
// import NavigationMenu from "../(layout)/navigation/pogo-menu";

export default function BuildPanels() {
    const supabase = useSupabaseClient();
    const session = useSession();
}