"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

interface OwnedItem {
    id: string;
    item: string;
    quantity: number;
    sector: string;
    notes?: string;
};

interface UserStructure {
    id: number;
    item: number; 
    name: string;
    description: string;
    cost: number;
    icon_url: string;
    ItemCategory: string;
    parentItem: number | null;
    itemLevel: number;   
};

interface MiningStructureModalProps {
    isOpen: boolean;
    onClose: () => void;
    ownedItem: OwnedItem;
    structure: UserStructure;
}

export const MiningStructureModal: React.FC<MiningStructureModalProps> = ({ isOpen, onClose, ownedItem, structure }) => {
    if (!isOpen) {
        return null;
    };
}